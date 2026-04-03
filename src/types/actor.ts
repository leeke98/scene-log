export type ActorDomain = "뮤지컬" | "연극" | "클래식" | "기타";
export type ActorStatus = "unverified" | "verified" | "merged";

export interface Actor {
  id: string;
  name: string;
  birthYear?: number;
  domain?: ActorDomain;
  status: ActorStatus;
}

export interface ActorSearchResult extends Actor {
  performances: string[]; // 출연작 최대 5개
}

export interface CreateActorRequest {
  name: string;
  domain?: ActorDomain;
  birthYear?: number;
}
