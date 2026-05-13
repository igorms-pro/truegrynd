export const ADMIN_QUEUE_PAGE_SIZE = 20;

export function adminQueueMaxPage(totalCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}
