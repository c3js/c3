import { isUndefined } from './util';

/**
 * Converts the rows to data.
 * @param {any[][]} rows The row data
 * @return {any[][]}
 */
export const convertRowsToData = (rows) => {
    const newRows = [];
    const keys = rows[0];

    for (let i = 1; i < rows.length; i++) {
        const newRow = {};
        for (let j = 0; j < rows[i].length; j++) {
            if (isUndefined(rows[i][j])) {
                throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
            }
            newRow[keys[j]] = rows[i][j];
        }
        newRows.push(newRow);
    }
    return newRows;
};

/**
 * Converts the columns to data.
 * @param {any[][]} columns The column data
 * @return {any[][]}
 */
export const convertColumnsToData = (columns) => {
    const newRows = [];

    for (let i = 0; i < columns.length; i++) {
        const key = columns[i][0];
        for (let j = 1; j < columns[i].length; j++) {
            if (isUndefined(newRows[j - 1])) {
                newRows[j - 1] = {};
            }
            if (isUndefined(columns[i][j])) {
                throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
            }
            newRows[j - 1][key] = columns[i][j];
        }
    }

    return newRows;
};
