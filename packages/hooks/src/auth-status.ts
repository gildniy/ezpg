export enum AuthStatus {
  Unauthenticated = "unauthenticated",
  NeedsTfa = "needs-tfa",
  NeedsPasswordChange = "needs-password-change",
  Authenticated = "authenticated",
  Unknown = "unknown",
  Loading = "loading",
}
