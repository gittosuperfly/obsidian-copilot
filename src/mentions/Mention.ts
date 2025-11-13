import { ImageProcessor } from "@/imageProcessing/imageProcessor";

export interface MentionData {
  type: string;
  original: string;
  processed?: string;
  error?: string;
}

export class Mention {
  private static instance: Mention;
  private mentions: Map<string, MentionData>;

  private constructor() {
    this.mentions = new Map();
  }

  static getInstance(): Mention {
    if (!Mention.instance) {
      Mention.instance = new Mention();
    }
    return Mention.instance;
  }

  extractAllUrls(text: string): string[] {
    // Match URLs and trim any trailing commas
    const urlRegex = /https?:\/\/[^\s"'<>]+/g;
    return (text.match(urlRegex) || [])
      .map((url) => url.replace(/,+$/, "")) // Remove trailing commas
      .filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates
  }

  extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s"'<>]+/g;
    return (text.match(urlRegex) || [])
      .map((url) => url.replace(/,+$/, ""))
      .filter((url, index, self) => self.indexOf(url) === index);
  }

  async processUrl(
    url: string
  ): Promise<{ response: string; elapsed_time_ms: number; error?: string }> {
    const message =
      "Remote URL processing has been disabled. Please copy relevant information into a note instead.";
    return { response: url, elapsed_time_ms: 0, error: message };
  }

  /**
   * Process a list of URLs directly (both regular and YouTube URLs).
   *
   * @param urls Array of URLs to process
   * @returns Processed URL context and any errors
   */
  async processUrlList(urls: string[]): Promise<{
    urlContext: string;
    imageUrls: string[];
    processedErrorUrls: Record<string, string>;
  }> {
    let urlContext = "";
    const imageUrls: string[] = [];
    const processedErrorUrls: Record<string, string> = {};

    // Return empty string if no URLs to process
    if (urls.length === 0) {
      return { urlContext, imageUrls, processedErrorUrls };
    }

    // Process all URLs concurrently
    const processPromises = urls.map(async (url) => {
      // Check if it's an image URL
      if (await ImageProcessor.isImageUrl(url, app.vault)) {
        imageUrls.push(url);
        return { type: "image", url };
      }

      // Regular URL
      if (!this.mentions.has(url)) {
        const processed = await this.processUrl(url);
        this.mentions.set(url, {
          type: "url",
          original: url,
          processed: "",
          error: processed.error,
        });
      }
      return { type: "url", data: this.mentions.get(url) };
    });

    const processedUrls = await Promise.all(processPromises);

    // Append all processed content
    processedUrls.forEach((result) => {
      if (result.type === "image") {
        // Already added to imageUrls
        return;
      }

      const urlData = result.data;
      if (!urlData) return;

      if (urlData.processed) {
        urlContext += `\n\n<url_content>\n<url>${urlData.original}</url>\n<content>\n${urlData.processed}\n</content>\n</url_content>`;
      }

      if (urlData.error) {
        processedErrorUrls[urlData.original] = urlData.error;
      }
    });

    return { urlContext, imageUrls, processedErrorUrls };
  }

  /**
   * Process URLs from user input text (both regular and YouTube URLs).
   *
   * IMPORTANT: This method should ONLY be called with the user's direct chat input,
   * NOT with content from context notes.
   *
   * @param text The user's chat input text
   * @returns Processed URL context and any errors
   */
  async processUrls(text: string): Promise<{
    urlContext: string;
    imageUrls: string[];
    processedErrorUrls: Record<string, string>;
  }> {
    const urls = this.extractUrls(text);
    return this.processUrlList(urls);
  }

  getMentions(): Map<string, MentionData> {
    return this.mentions;
  }

  clearMentions(): void {
    this.mentions.clear();
  }
}
