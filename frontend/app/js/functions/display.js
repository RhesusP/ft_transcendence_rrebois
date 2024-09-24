export const remove_modal_backdrops = () => {
    const modalBackdrops = document.getElementsByClassName('modal-backdrop');
    if (modalBackdrops.length > 0) {
        for (let i = 0; i < modalBackdrops.length; i++) {
            modalBackdrops[i].remove();
        }
    }
}