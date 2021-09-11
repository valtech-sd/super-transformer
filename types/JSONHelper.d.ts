export = JSONHelper;
declare class JSONHelper {
    /**
     * Validates that a passed string can be parsed as JSON and return it as an object.
     *
     * @param inputjson
     * @returns {null|any}
     */
    static parseJson(inputjson: any): null | any;
}
