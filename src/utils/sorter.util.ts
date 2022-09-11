export default {
  sortByIdentifier(arr: any, desc: number) {
    return arr.sort((a: any, b: any) =>
     desc * ( a["identifier"].localeCompare(b["identifier"]))
    );
  },
};
