/** dsh-session-list — host half: a no-op Cordis plugin. The whole feature
 *  lives in the browser half (exports "./client"); this row only needs to
 *  resolve and activate so client-modules serves the client bundle. */
export const inject = [];
export function apply() {}
