// Mini « store » réactif très simple – facultatif mais pratique
export const state = {
  user: null,
  leaderboard: [],
}

export function setUser(u)        { state.user = u }
export function setLeaderboard(l) { state.leaderboard = l }