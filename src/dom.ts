import { JSDOM } from 'jsdom';
import { HTMLElement } from './types';

export function getElementsFromHtmlByQuerySelectorAll( html: string | HTMLElement, selector: string ) {

    let arr: any[] = []

    if (typeof html === "string") {
        const dom = new JSDOM( html );

        const document = dom.window.document;

        document.querySelectorAll( selector ).forEach( elem => arr.push( elem ));

        // error TS2802: Type 'NodeListOf<Element>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
        //return [ ...document.querySelectorAll( selector ) ] as HTMLElement[];
    } else {
        html.querySelectorAll( selector ).forEach( elem => arr.push( elem ));
        
        // error TS2802: Type 'NodeListOf<Element>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
        //return [ ...html.querySelectorAll( selector ) ] as HTMLElement[];
    }

    return arr;
}