export default {
  paginate(arr: Array<any>, page: number) {
    return arr.slice(10 * (page - 1), 10 * page);
  },
};
