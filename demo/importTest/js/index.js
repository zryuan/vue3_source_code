import { flag } from './testa.js'
console.log('index.js');
console.log('flag', flag);
document.querySelector(".btn").addEventListener("click", () => {
    console.log(flag);
});