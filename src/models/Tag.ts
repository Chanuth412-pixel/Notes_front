export interface Tag {
  id: number;            // Changed to number to match Spring Boot Long type
  name: string;          // Name of the tag (e.g., "important", "work", etc.)
  isSystemTag: boolean;  // Flag to determine if the tag is system-defined or custom
}
