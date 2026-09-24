export function canSuspendUser(actorId: number, targetUserId: number) {
  return actorId !== targetUserId;
}

export function canDemoteUser(actorId: number, targetUserId: number, nextRole: "user" | "admin") {
  return actorId !== targetUserId || nextRole === "admin";
}
