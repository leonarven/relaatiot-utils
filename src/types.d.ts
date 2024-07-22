export type HTMLElement = Element & {
    style: {
        left: string;
        top: string;
    };
    /* textContent: string;
    id: string;
    className: string;

    getAttribute: (name: string) => string | void;

    querySelectorAll: (selector: string) => HTMLElement[]; */
}