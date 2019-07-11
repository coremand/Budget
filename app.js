//BUDGET MODULE:

var budgetController = (function(){

    function Expense(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100) 
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    function Income(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals: {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    return {
        addItem : function(type, des, val){
            var newItem;
            //CREATE NEW ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }
            
            //CREATE NEW ITEM BASED ON TYPE

            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            } else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            //return an array of current ids:
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget : function() {
            //Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            //calculate budget:
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income:
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages : function() {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
             var allperc = data.allItems.exp.map(function(cur) {
                 return cur.getPercentage();
             });
             return allperc;
        },

        getBudget : function(){

            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        }
    }


})();


// UI MODULE:

var uiControler = (function(){
    
    var domStrings = {
        inputType : ".add__type",
        inputDescription : ".add__description",
        inputValue : ".add__value",
        inputButton : ".add__btn",
        incomeContainer : ".income__list",
        expensesContainer : ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel : ".budget__income--value",
        expenseLabel : ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
     };

     var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        
        return (type === "exp"?  "-" :  "+") + " " + int + "." + dec;
    };

        var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
       };


     return {
         getInput: function(){

            return {
                type : document.querySelector(domStrings.inputType).value,
                description : document.querySelector(domStrings.inputDescription).value,
                value : parseFloat(document.querySelector(domStrings.inputValue).value)
            };

            },

          addListItem : function(obj, type) {
              var html, newHtml, element;
            //Create html string with placeholder text:
            
            if(type === "inc") {
             element = domStrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }else if(type == "exp") {
            element = domStrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //REPLACE placeholder text with some actual data:
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace( '%description%', obj.description);
            newHtml = newHtml.replace( '%value%', formatNumber(obj.value, type));

            //Insert HTML into DOM:
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

          },

          deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
          },

          clearFields: function(){
              var fields, fieldsArr;

              fields = document.querySelectorAll(domStrings.inputDescription + ", " + domStrings.inputValue);
              fieldsArr = Array.prototype.slice.call(fields);

              fieldsArr.forEach(function(current, index, array) {
                  current.value = "";
              });
              fieldsArr[0].focus();
          },

          displayBudget : function(obj){
              var type;
              obj.budget > 0 ? type = "inc" : type = "exp";
              document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
              document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
              document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");
              document.querySelector(domStrings.percentageLabel).textContent = obj.percentage;

              if(obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + "%";
              }else {
                document.querySelector(domStrings.percentageLabel).textContent = "----";
              }
          },

          displayPercentages: function(percentages){
            fields = document.querySelectorAll(domStrings.expensesPercLabel); 

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            })
          },
          
          displayMonth : function(){
              var now, months, month, year;
              var now = new Date();

              months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              month = now.getMonth();

              year = now.getFullYear();
             
              document.querySelector(domStrings.dateLabel).textContent = months[month] + " " + year;
          },

          changedType : function(){
            var fields = document.querySelectorAll(domStrings.inputType + "," + domStrings.inputDescription + "," + domStrings.inputValue);
             nodeListForEach(fields, function(cur) {
                 cur.classList.toggle("red-focus");
             });
             document.querySelector(domStrings.inputButton).classList.toggle("red");
          },

          getdomStrings : function(){
                return domStrings;
        }

        
    }

})();

//CONTROLER MODULE:

var controller = (function(budgetCtrl, UICtrl){

     var setUpEventListeners = function() {
        var DOM = UICtrl.getdomStrings();
        document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);  

             //KEYPRESS EVENT LISTENER:
        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
      });

      document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
      document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
     }
    

     var updateBudget = function() {
         //calculate Budget:
         budgetCtrl.calculateBudget();
         //Returns Budget:
         var budget = budgetCtrl.getBudget();
         //display Budget:
        UICtrl.displayBudget(budget);
     }

     var updatePercentages = function(){
         //calculate percentage
         budgetCtrl.calculatePercentages();
         //Read percentages from the budget controller:
         var percentages = budgetCtrl.getPercentages();
         // update the UI with the new percentages:
         UICtrl.displayPercentages(percentages);
     }
    
    
     var ctrlAddItem = function() {
        var input, newItem
        //call getinput public function
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        //ADD ITEM TO THE BUDGET CONTROLLER:
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //ADD ITEM TO THE CONTROLLER MODULE:
        UICtrl.addListItem(newItem, input.type);
        //Clear Field:
        UICtrl.clearFields();
        //calculate and update Budget:
        updateBudget();
        //calculate and update percentages:
        updatePercentages();
        
        }
       };

       //Setting up delete event with event delegation:

       var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        //Using traversing:
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            //inc-1
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //Delte item from data structure:
            budgetCtrl.deleteItem(type, ID);
            //Delete item from the UI:
            UICtrl.deleteListItem(itemID);
            //Update and show the new budget:
            updateBudget();
            //calculate and update percentages:
            updatePercentages();
        }
        
    };



     return {
         init: function(){
             UICtrl.displayMonth();
            UICtrl.displayBudget(  {
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
             setUpEventListeners();
             
        }
      };



})(budgetController, uiControler);

controller.init();