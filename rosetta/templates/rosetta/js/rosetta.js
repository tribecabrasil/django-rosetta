{% load rosetta %}

google.setOnLoadCallback(function() {
    $('.location a').show().toggle(function() {
        $('.hide', $(this).parent()).show();
    }, function() {
        $('.hide', $(this).parent()).hide();
    });

{% if rosetta_settings.ENABLE_TRANSLATION_SUGGESTIONS %}
   {% if rosetta_settings.AZURE_CLIENT_ID and rosetta_settings.AZURE_CLIENT_SECRET or rosetta_settings.GOOGLE_TRANSLATE %}
    $('a.suggest').click(function(e){
        e.preventDefault();
        var a = $(this);
        var str = a.html();
        var orig = $('.original .message', a.parents('tr')).html();
        var trans=$('textarea',a.parent());
        var sourceLang = '{{ rosetta_settings.MESSAGES_SOURCE_LANGUAGE_CODE }}';
        var destLang = '{{ rosetta_i18n_lang_code }}';

        orig = unescape(orig).replace(/<br\s?\/?>/g,'\n').replace(/<code>/,'').replace(/<\/code>/g,'').replace(/&gt;/g,'>').replace(/&lt;/g,'<');
        a.attr('class','suggesting').html('...');

        $.getJSON("./translate/", {
                from: sourceLang,
                to: destLang,
                text: orig
            }, 
            function(data) {
                if (data.success){
                    trans.val(unescape(data.translation).replace(/&#39;/g,'\'').replace(/&quot;/g,'"').replace(/%\s+(\([^\)]+\))\s*s/g,' %$1s '));
                    a.hide();
                } else {
                    a.text(data.error);
                }
            }
        );
    });
   {% endif %}

   {% if rosetta_settings.YANDEX_TRANSLATE_KEY %}
    $('a.suggest').click(function(e){
        e.preventDefault();
        var a = $(this);
        var str = a.html();
        var orig = $('.original .message', a.parents('tr')).html();
        var trans=$('textarea',a.parent());
        var apiUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate";

        a.attr('class','suggesting').html('...');

        var apiData = {
            error: 'onTranslationError',
            success: 'onTranslationComplete',
            lang: '{{ rosetta_settings.MESSAGES_SOURCE_LANGUAGE_CODE }}-{{ rosetta_i18n_lang_code }}',
            key: '{{ rosetta_settings.YANDEX_TRANSLATE_KEY }}',
            format: 'html',
            text: orig
        };

        $.ajax({
            url: apiUrl,
            data: apiData,
            dataType: 'jsonp',
            success: function(response) {
                if (response.code == 200) {
                    trans.val(response.text[0].replace(/<br>/g, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
                    a.hide();
                } else {
                    a.text(response);
                }
            },
            error: function(response) {
                a.text(response);
            }
        });
    });
   {% endif %}
{% endif %}

    $('td.plural').each(function(i) {
        var td = $(this), trY = parseInt(td.closest('tr').offset().top);
        $('textarea', $(this).closest('tr')).each(function(j) {
            var textareaY=  parseInt($(this).offset().top) - trY;
            $($('.part',td).get(j)).css('top',textareaY + 'px');
        });
    });
    
    $('.translation textarea').blur(function() {
        if($(this).val()) {
            $('.alert', $(this).parents('tr')).remove();
            var RX = /%(?:\([^\s\)]*\))?[sdf]/g,
                origs=$('.original', $(this).parents('tr')).html().match(RX),
                trads=$(this).val().match(RX),
                error = $('<span class="alert">Unmatched variables</span>');
            if (origs && trads) {
                for (var i = trads.length; i--;){
                    var key = trads[i];
                    if (-1 == $.inArray(key, origs)) {
                        $(this).before(error)
                        return false;
                    }
                }
                return true;
            } else {
                if (!(origs === null && trads === null)) {
                    $(this).before(error);
                    return false;
                }
            }
            return true;
        }
    });

    $('.translation textarea').eq(0).focus();
    
});
