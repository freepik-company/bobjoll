interface Element {
	parents(selector?: string): Element[];
}

Element.prototype.parents = function(this: any, selector?: string | undefined): any {
	var elements = [];
	var elem = this;
	var ishaveselector = selector !== undefined;

	if (elem && elem.parentElement) {
		while ((elem = elem.parentElement) !== null) {
			if (elem.nodeType !== Node.ELEMENT_NODE) {
				continue;
			}
	 
			if (!ishaveselector || elem.matches(selector)) {
				elements.push(elem);
			}
		}
	 
		return elements; 		
	}
};