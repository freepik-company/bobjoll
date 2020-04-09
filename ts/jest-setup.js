// (function() {
//     function insertAdjacentElement(position, elem) {
//         let _this = this,
//             parent = _this.parentNode,
//             node, first, next;
      
//         switch (position.toLowerCase()) {
//           case 'beforebegin':
//             while ((node = elem.firstChild)) {
//               parent.insertBefore(node, _this);
//             }
//             break;
//           case 'afterbegin':
//             first = _this.firstChild;
//             while ((node = elem.lastChild)) {
//               first = _this.insertBefore(node, first);
//             }
//             break;
//           case 'beforeend':
//             while ((node = elem.firstChild)) {
//               _this.appendChild(node);
//             }
//             break;
//           case 'afterend':
//             parent.insertBefore(elem, _this.nextSibling);
//             break;
//         }
//         return elem;
//     }

//     Node.prototype.insertAdjacentElement = Node.prototype.insertAdjacentElement || insertAdjacentElement;
// }());
