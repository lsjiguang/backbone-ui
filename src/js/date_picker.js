(function(){
  window.Backbone.UI.DatePicker = Backbone.View.extend({

    options : {
      // a moment.js format : http://momentjs.com/docs/#/display/format
      format : 'MM/DD/YYYY',
      model : null,
      property : null,
      name : null
    },

    initialize : function() {
      $(this.el).addClass('date_picker');

      this._textField = new Backbone.UI.TextField({
        name : this.options.name
      }).render();

      this._calendar = new Backbone.UI.Calendar({
        onSelect : _(this._selectDate).bind(this)
      });
      $(this._calendar.el).hide();
      document.body.appendChild(this._calendar.el);

      $(this._textField.input).click(_(this._showCalendar).bind(this));
      $(this._textField.input).keyup(_(this._dateEdited).bind(this));

      $(this._calendar.el).autohide({
        ignoreInputs : true,
        leaveOpenTargets : [this._calendar.el]
      });

      // listen for model changes
      if(!!this.model && this.options.property) {
        this.model.bind('change:' + this.options.property, _(this.render).bind(this));
      }
    },

    render : function() {
      $(this.el).empty();

      var date = (!!this.model && !!this.options.property) ? 
        _(this.model).resolveProperty(this.options.property) : new Date();
      this._calendar.options.selectedDate = date;
      this._calendar.render();

      this.el.appendChild(this._textField.el);
      
      return this;
    },

    _showCalendar : function() {
      $(this._calendar.el).show();
      $(this._calendar.el).alignTo(this._textField.el, 'bottom -left', 0, 2);
    },

    _hideCalendar : function() {
      $(this._calendar.el).hide();
    },

    _selectDate : function(date) {
      var month = date.getMonth() + 1;
      if(month < 10) month = '0' + month;

      var day = date.getDate();
      if(day < 10) day = '0' + day;

      var dateString = moment(date).format(this.options.format);
      this._textField.setValue(dateString);
      this._dateEdited();
      this._hideCalendar();
      return false;
    },

    _dateEdited : function(e) {
      var newDate = moment(this._textField.getValue(), this.options.format);

      // if the enter key was pressed or we've invoked this method manually, 
      // we hide the calendar and re-format our date
      if(!e || e.keyCode == Backbone.UI.KEYS.KEY_RETURN) {
        console.log(newDate);
        this._textField.setValue(moment(newDate).format(this.options.format));
        this._hideCalendar();

        // update our bound model (but only the date portion)
        if(!!this.model && this.options.property) {
          var boundDate = _(this.model).resolveProperty(this.options.property);
          boundDate.setMonth(newDate.getMonth());
          boundDate.setDate(newDate.getDate());
          boundDate.setFullYear(newDate.getFullYear());
        }
      }
    }
  });
}());