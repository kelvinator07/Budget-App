var budgetController = (function() {

    function Expense(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function(totalExpenses) {
        if (totalExpenses > 0) {
            this.percentage = Math.round((this.value / totalExpenses) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    function calculateTotal(type) {
        var sum = 0;
        sum = data.allItems[type].reduce(function(sum, current) {
            return sum + current.value;
        }, 0);

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new ID using last ID in Array
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 1;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
            
        },

        deleteItem: function(type, id) {
            
            var ids, index;
            // id = 6
            // ids = [1 2 4 6 9]
            // index = 3
            ids = data.allItems[type].map(function(current, index, array) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            // calc total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calc budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // calc percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {
            // calc Percentage
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            // get All Percentages
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        getAllData: function() {
            return data.allItems;
        }
    }
})();

var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        outputIncomeList: '.income__list',
        outputExpenseList: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpenseLabel: '.budget__expenses--value',
        budgetPercentLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    function formatNumber(number, type) {
        // + or - before number
        // comma seperating thousands

        var num, numSplit, int, decimalPart;

        num = Math.abs(number);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 1234 = 1,234
        }

        decimalPart = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + decimalPart;
    }

    function nodeListForEach(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        updateUIList: function(newItem, type) {

            var html, newHtml, element;

            // create HTML strings
            if (type === 'inc') {
                element = DOMstrings.outputIncomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.outputExpenseList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', newItem.id);
            newHtml = newHtml.replace('%description%', newItem.description);
            newHtml = newHtml.replace('%value%', formatNumber(newItem.value, type));
            if (type === 'exp') {
                // newHtml = newHtml.replace('%percentage%', newItem.percentage);
            }

            // insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        updateBudgetUI: function(obj) {
            //debugger;
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.budgetExpenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.budgetPercentLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.budgetPercentLabel).textContent = '---';
            }

        },

        updatePercentages: function(percentages) {

            var fields;
            
            fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function() {

            var now, month, months, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        }

    };
})();

var controller = (function(budgetCtrl, UICtrl) {

    function setUpEventListeners() {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', addItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                addItem();
            }
            
        });   
        
        document.querySelector(DOM.container).addEventListener('click', deleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    }

    function updateBudget() {

        // calculate the budget
        budgetCtrl.calculateBudget();

        // Return budget
        var budget = budgetCtrl.getBudget();

        // display the budget on UI
        UICtrl.updateBudgetUI(budget);

    }

    function updatePercentages() {

        // calculate the percentages
        budgetCtrl.calculatePercentages();

        // Read percentages from budget calculator 
        var percentages = budgetCtrl.getPercentages();

        // Update UI with new percentages
        UICtrl.updatePercentages(percentages);

    }
    

    function addItem() {

        var input, newItem;

        // Get values from fields
        input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add new item to user interface
            UICtrl.updateUIList(newItem, input.type);

            // Clear fields
            UICtrl.clearFields();

            // calculate and updateBudget
            updateBudget();

            // calculate and updatePercentages
            updatePercentages();
        }

    }

    function deleteItem(event) {

        var splitID, itemId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;


        if (itemId) {
            // inc-1
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete from UI
            UICtrl.deleteListItem(itemId);

            // Update and show new Bugdet.. update UI
            updateBudget();

        }

    }

  
    return {
        init: function() {
            console.log('App Started');
            UICtrl.displayMonth();
            setUpEventListeners();
            UICtrl.updateBudgetUI({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: 0
            });

        }
    }

})(budgetController, UIController);

controller.init();