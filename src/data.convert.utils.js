import { isUndefined } from './util';

/**
 * Converts the rows to data.
 * @param {any[][]} rows The row data
 * @return {any[][]}
 */
export const convertRowsToData = (rows) => {
    const new_rows = [];
    const keys = rows[0];
    let new_row , i, j;

    for (i = 1; i < rows.length; i++) {
        new_row = {};
        for (j = 0; j < rows[i].length; j++) {
            if (isUndefined(rows[i][j])) {
                throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
            }
            new_row[keys[j]] = rows[i][j];
        }
        new_rows.push(new_row);
    }
    return new_rows;
};

/**
 * Converts the columns to data.
 * @param {any[][]} columns The column data
 * @return {any[][]}
 */
export const convertColumnsToData = (columns) => {
    const new_rows = [];
    let i, j, key;

    for (i = 0; i < columns.length; i++) {
        key = columns[i][0];
        for (j = 1; j < columns[i].length; j++) {
            if (isUndefined(new_rows[j - 1])) {
                new_rows[j - 1] = {};
            }
            if (isUndefined(columns[i][j])) {
                throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
            }
            new_rows[j - 1][key] = columns[i][j];
        }
    }

    return new_rows;
};
