export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Tag {
  id?: number;
  name: string;
}

export interface Note {
  id?: number;             // Optional for creation, required for updates
  title: string;           // Title of the note
  content: string;         // Content of the note
  tags: Tag[];            // Array of Tag objects (not strings)
  category: Category | null;      // Category object
}
