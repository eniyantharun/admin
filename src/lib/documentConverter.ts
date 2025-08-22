// Document format conversion utilities for API integration

export interface DocumentNode {
  type: 'Paragraph' | 'Text' | 'Image';
  level?: number;
  children?: DocumentNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  foreground?: string;
  asset?: any;
  assetId?: string;
  alignment?: 'Left' | 'Center' | 'Right';
}

export interface DocumentContent {
  children: DocumentNode[];
}

export interface AddDocumentRevisionRequest {
  documentId: string;
  content: DocumentContent;
}

export interface AddDocumentRevisionResponse {
  revisionIndex: number;
  createdAt: string;
}

/**
 * Convert HTML from React Quill to the API's document format
 */
export const htmlToDocumentFormat = (html: string): DocumentContent => {
  // Create a temporary DOM element to parse HTML
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      children: [{
        type: 'Paragraph',
        level: 0,
        children: [{
          type: 'Text',
          text: html.replace(/<[^>]*>/g, '') // Strip HTML tags
        }]
      }]
    };
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const children: DocumentNode[] = [];

  // Process each top-level element
  Array.from(tempDiv.children).forEach((element) => {
    const paragraphNode = processParagraphElement(element as HTMLElement);
    if (paragraphNode) {
      children.push(paragraphNode);
    }
  });

  // If no children or only empty content, add an empty paragraph
  if (children.length === 0 || (children.length === 1 && !children[0].children?.length)) {
    children.push({
      type: 'Paragraph',
      level: 0,
      children: [{
        type: 'Text',
        text: ' '
      }]
    });
  }

  return { children };
};

/**
 * Process a paragraph-level HTML element
 */
const processParagraphElement = (element: HTMLElement): DocumentNode | null => {
  const tagName = element.tagName.toLowerCase();
  
  // Determine paragraph level based on heading tags
  let level = 0;
  if (tagName === 'h1') level = 1;
  else if (tagName === 'h2') level = 2;
  else if (tagName === 'h3') level = 3;

  const children: DocumentNode[] = [];

  // Process child nodes
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim()) {
        children.push({
          type: 'Text',
          text: text
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const textNode = processTextElement(node as HTMLElement);
      if (textNode) {
        children.push(textNode);
      }
    }
  });

  // Handle empty paragraphs
  if (children.length === 0) {
    children.push({
      type: 'Text',
      text: ' '
    });
  }

  return {
    type: 'Paragraph',
    level,
    children
  };
};

/**
 * Process inline text elements with formatting
 */
const processTextElement = (element: HTMLElement): DocumentNode | null => {
  const tagName = element.tagName.toLowerCase();
  const text = element.textContent || '';
  
  if (!text.trim()) return null;

  const textNode: DocumentNode = {
    type: 'Text',
    text: text
  };

  // Apply formatting based on HTML tags
  if (tagName === 'strong' || tagName === 'b') {
    textNode.bold = true;
  }
  if (tagName === 'em' || tagName === 'i') {
    textNode.italic = true;
  }
  if (tagName === 'u') {
    textNode.underline = true;
  }
  if (tagName === 's' || tagName === 'strike' || tagName === 'del') {
    textNode.strikethrough = true;
  }

  // Check for color styling
  const style = element.getAttribute('style');
  if (style) {
    const colorMatch = style.match(/color:\s*([^;]+)/);
    if (colorMatch) {
      textNode.foreground = colorMatch[1].trim();
    }
  }

  // Handle nested formatting
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 600) {
    textNode.bold = true;
  }
  if (computedStyle.fontStyle === 'italic') {
    textNode.italic = true;
  }
  if (computedStyle.textDecoration?.includes('underline')) {
    textNode.underline = true;
  }
  if (computedStyle.textDecoration?.includes('line-through')) {
    textNode.strikethrough = true;
  }

  return textNode;
};

/**
 * Convert document format back to HTML for React Quill
 */
export const documentFormatToHtml = (content: DocumentContent): string => {
  return content.children.map(node => paragraphNodeToHtml(node)).join('');
};

/**
 * Convert a paragraph node to HTML
 */
const paragraphNodeToHtml = (node: DocumentNode): string => {
  if (node.type === 'Paragraph') {
    const tag = node.level === 1 ? 'h1' : node.level === 2 ? 'h2' : node.level === 3 ? 'h3' : 'p';
    const childrenHtml = node.children?.map(child => textNodeToHtml(child)).join('') || '';
    return `<${tag}>${childrenHtml}</${tag}>`;
  }
  return '';
};

/**
 * Convert a text node to HTML
 */
const textNodeToHtml = (node: DocumentNode): string => {
  if (node.type === 'Text') {
    let html = node.text || '';
    
    // Apply formatting
    if (node.bold) {
      html = `<strong>${html}</strong>`;
    }
    if (node.italic) {
      html = `<em>${html}</em>`;
    }
    if (node.underline) {
      html = `<u>${html}</u>`;
    }
    if (node.strikethrough) {
      html = `<s>${html}</s>`;
    }
    if (node.foreground) {
      html = `<span style="color: ${node.foreground}">${html}</span>`;
    }
    
    return html;
  }
  return '';
};

/**
 * Debounce function for API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};