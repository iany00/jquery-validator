/**
 * Created by iany00 on 3/10/2015.
 */

/**
 * Validator helper
 * @type {
 * {rules: {},
 * messages: {},
 * formId: string,
 * URL: string,
 * errorHolder: string,
 * errorsArr: {},
 * init: Function,
 * formValidate: Function,
 * formSubmit: Function}
 * }
 */
var ValidatorWithMessages = {

    rules           : {},
    messages        : {},
    formId          : '#formId',
    URL             : '',
    errorHolder     : '#errorsHolder',
    errorsArr       : {},

    init: function() {

        /*
        * Integrate Laravel rules from here or
        * In application/config/application.php change the following line:
        * 'Form' => 'Laravel\\Form', to  'Form' => 'Jquery_Validator\\Form'
        */
        var parent = this;
        var rules = JSON.parse(this.rules);

        $.each(rules, function(key, value) {
            var inputName = '[name^="'+ key +'"]';
            $(parent.formId +' ' + inputName).attr('data-validations', value);
        });

        // init validate
        this.formValidate();
    },
    formValidate: function()
    {
        // Prepare for on submit
        var parent = this;
        parent.errorsArr = {};


        var selectors = [this.formId + ' input[type!=submit]',
                         this.formId + ' select',
                         this.formId + ' textarea'
                        ];
        selectors = selectors.join(', ');


        $(this.formId).validator({
            events   : 'submit',
            selector : selectors,
            preventDefault : true,

            callback: function (elem, valid, rule)
            {
                // remove previous errors
                $(elem).removeClass('error');

                var attrName = $(elem).attr('name');
                var alphaAttrName = attrName.replace(/\W/g, '');
                delete(parent.errorsArr[alphaAttrName]);

                if (!valid)
                {

                    // Add error class
                    $(elem).addClass('error');

                    // In case we validate a dummy input: add data-id
                    var elemId = $(elem).attr('id');
                    $('[data-id="' + elemId + '"]').addClass('error');

                    // Get error message
                    var messages = JSON.parse(parent.messages);
                    var rulesArr = rule.split('|');
                    var messageArr = [];

                    $.each(rulesArr, function (key, ruleValue)
                    {
                        var message = messages[alphaAttrName + '.' + ruleValue];
                        messageArr[key] = '<li class="error_' + alphaAttrName + '">' + message + '</li>';
                        parent.errorsArr[alphaAttrName] = messageArr;
                    });

                }
            },
            done: function(valid) {

                if(valid)
                {
                    // do submit
                    parent.formSubmit();

                    // remove all error messages and classes
                    $(parent.formId).find('.error').removeClass('error');
                    $(parent.errorHolder).empty();

                } else {

                    if(Object.keys(parent.errorsArr).length > 0)
                    {
                        var html = '';
                        $.each(parent.errorsArr, function(key, value) {
                            $.each(value, function(key, value) {
                                html += value;
                            });
                        });
                        html = $.parseHTML(html);

                        // Show error messages in container
                        $(parent.errorHolder).empty();
                        $(parent.errorHolder).append(html);
                    }
                }
            }
        });
    },
    formSubmit: function() // Execute form
    {
        var parent = this;
        var params = $(this.formId).serializeArray();

        if(this.URL.length == 0) {
            this.URL = $(this.formId).attr('action');
        }

        $.post(this.URL, $.param(params), function(result)
        {
            // Show results here ...

        }).fail(function(xhr, err, errText)
        {
            // Show errors ...
            var errorText = xhr.responseText;
            $(parent.errorHolder).empty().html(errorText);

        }).always(function() {
            // ...
        });
    }
};