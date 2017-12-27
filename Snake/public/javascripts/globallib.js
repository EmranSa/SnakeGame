Array.prototype.findInObject = function (key, value, caseinsensitive = false) {
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        var arr = obj[key];
        if (caseinsensitive) {
            if (arr.toString().toLowerCase() == value.toString().toLowerCase()) {
                return obj;
            }
        }
        else {
            if (arr == value) {
                return obj;
            }
        }
    }
}