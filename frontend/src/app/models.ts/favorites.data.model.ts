import { Film } from "./film.model";

export class Favorites {
    success?: boolean;
    data?: Film[];
    favorites?: Film[];
    message?: string;
}