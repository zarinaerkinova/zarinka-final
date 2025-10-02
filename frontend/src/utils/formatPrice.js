const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export default formatPrice;