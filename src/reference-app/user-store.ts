export class InMemoryUserStore {
    private readonly usernames: string[];
  
    constructor(initialUsernames: string[] = []) {
      this.usernames = [...initialUsernames];
    }
  
    has(username: string): boolean {
      return this.usernames.includes(username);
    }
  
    add(username: string): void {
      this.usernames.push(username);
    }
  
    count(username: string): number {
      return this.usernames.filter(
        (storedUsername) => storedUsername === username
      ).length;
    }
  
    snapshot(): string[] {
      return [...this.usernames];
    }
  }