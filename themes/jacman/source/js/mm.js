$(function() {
    if (window.location.pathname.indexOf('stat') != -1) {
        $("table").addClass("ggstat")
    }

    if (window.location.host[0] == "1") return
    AV.init({
        appId: "Ab21p9Df2hlkXxzSiwHuUSr5",
        appKey: "MNphO03YUzWhy9k6rHHi4eHA",
        serverURLs: "https://lcapi.swift.gg"
    });
    var ArticleViewCount = AV.Object.extend("ArticleViewCount");
    var queryViewCount = new AV.Query(ArticleViewCount)
    queryViewCount.limit(1000)
    if (window.location.pathname == "/" || window.location.pathname.indexOf("page/") !== -1) {
        var allUrl = $("a[itemprop='url']").map(function () {
            return $(this).attr("href")
        }).get()
        queryViewCount.containedIn("url", allUrl)
        queryViewCount.find().then(function (results) {
            for (var i = 0; i < results.length; i++) {
                $("a[href='" + results[i].get("url") +"']").parent().next().find(".viewcount").text(results[i].get("count"))
            }
            $(".viewcount").filter(function(index) {
                return $(this).text().length === 0
            }).text("0")
        }).catch(function () {
            $(".viewcount").text("nil")
        })
        return
    } else {
        var url = window.location.pathname;
        if (url[url.length - 1] != "/") {
            url += "/"
        }
        queryViewCount.equalTo("url", url)
        queryViewCount.find().then(function (results) {
            if (results.length) {
               var articleViewCount = results[0]
               articleViewCount.set("count", articleViewCount.get("count") + 1)
               $(".viewcount").text(articleViewCount.get("count"))
               articleViewCount.save(null)
            }
            else {
                var articleViewCount = new ArticleViewCount()
                articleViewCount.set("url", url)
                articleViewCount.set("count", 1)
                $(".viewcount").text(1)
                articleViewCount.save(null)
            }
        }).catch(function () {
            $(".viewcount").text(1)
        })
    }
})