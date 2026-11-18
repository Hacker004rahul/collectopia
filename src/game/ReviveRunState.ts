export class ReviveRunState {
  private availableValue = true;
  private attemptedValue = false;
  private pendingValue = false;

  get available(): boolean {
    return this.availableValue;
  }

  beginAttempt(): boolean {
    if (!this.availableValue || this.attemptedValue || this.pendingValue) {
      return false;
    }

    this.attemptedValue = true;
    this.pendingValue = true;
    return true;
  }

  completeAttempt(): boolean {
    if (!this.pendingValue || !this.availableValue) return false;

    this.pendingValue = false;
    this.availableValue = false;
    return true;
  }

  failAttempt(): void {
    this.pendingValue = false;
  }

  reset(): void {
    this.availableValue = true;
    this.attemptedValue = false;
    this.pendingValue = false;
  }
}
