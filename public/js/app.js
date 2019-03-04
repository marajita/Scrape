$(document).ready(function () {
  $("#scrapeNewArticle").click(function () {
    console.log("Button Clicked")
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/scrape"
      })
      // With that done, add the note information to the page
      .then(function (data) {
        if (data) {
          alert("Data Scrapped Successfully!")
        }
      });

  });
});