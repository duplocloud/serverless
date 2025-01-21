/**
 * A Generic Error class for Duplo
 */
export class DuploError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuploError";
  }
}
