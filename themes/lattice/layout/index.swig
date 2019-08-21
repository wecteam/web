{% extends '_layout.swig' %}

{% block page_class %}page-index{% endblock %}

{% block main %}
<script>
    // 判断是否有code和state
    var _tsearch = location.search.replace(/^\?/,"").split("&");
    if (_tsearch.some(function(ceil){return /^code=/.test(ceil)}) && _tsearch.some(function(ceil){return /^state=/.test(ceil)})) {
        // 都存在
        location.href = decodeURIComponent(_tsearch.filter(function(ceil){return /^state=/.test(ceil)})[0].replace(/^state=/,"")).replace(/([^#]+)#?.*$/,"$1#" + _tsearch.filter(function(ceil){return /^code=/.test(ceil)})[0]);
    }
</script>
    {% include '_partial/index/banner.swig' %}
    {% include '_partial/index/main.swig' %}
{% endblock %}

{% block footer %}
    {% parent %}
    {% include '_partial/common/post_tpl.swig' %}
{% endblock %}