export default {
  paginate(arr: Array<any>, page: number, size: number = 5) {
    return arr.slice(size * (page - 1), size * page);
  },
};
