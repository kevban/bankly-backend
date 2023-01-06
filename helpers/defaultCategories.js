/**
 * Gets the default categories that every user has at the beginning.
 * @returns {Array} list of Category objects
 */

function getDefaultCategories() {
    return [
        {
            iconId: 0,
            name: 'Daily',
            color: '#42a5f5'
        },
        {
            iconId: 1,
            name: 'Food',
            color: '#ba68c8'
        },
        {
            iconId: 2,
            name: 'Transportation',
            color: '#ef5350'
        },
        {
            iconId: 3,
            name: 'Lodging',
            color: '#ff9800'
        },
        {
            iconId: 4,
            name: 'Telephone',
            color: '#03a9f4'
        },
        {
            iconId: 5,
            name: 'Entertainment',
            color: '#4caf50'
        },
        {
            iconId: 6,
            name: 'Medical',
            color: '#1976d2'
        },
        {
            iconId: 7,
            name: 'School',
            color: '#9c27b0'
        },
        {
            iconId: 8,
            name: 'Travel',
            color: '#ed6c02'
        },
    ]
}

module.exports = getDefaultCategories