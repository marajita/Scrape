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
          //alert("Data Scrapped Successfully!")
          var r = confirm("Data Scrapped Successfully!");
          if (r == true) {
            location.reload();
          }
        }
      });
  });
});

// When you click the savenote button
$(document).on("click", ".save-article", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/saveArticle/" + thisId
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      location.reload();
    });

});

// When you click the delete button
$(document).on("click", ".delete-article", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/deleteArticle/" + thisId
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      location.reload();
    });
});

// When you click the article notes button
$(document).on("click", ".article-notes", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  refreshArticleNotes(thisId);
});

function refreshArticleNotes(id) {
  $.ajax({
      method: "GET",
      url: "/articles/" + id
    })
    // With that done
    .then(function (data) {

      if (data) {
        article = data;
        console.log(article);
        $("#article-id").text(article._id);

        var $noteList = $("#note-list");
        $noteList.empty();
        var rowsToAdd = [];
        for (var i = 0; i < article.notes.length; i++) {
          var noteLi = $("<li>");
          noteLi.attr("data-id", article.notes[i]._id);
          noteLi.attr("class", "list-group-item");
          var noteP = $("<p>");
          noteP.text(article.notes[i].body);
          var noteButton = $("<button>");
          noteButton.attr("data-id", article.notes[i]._id);
          noteButton.attr("article-data-id", article._id);
          noteButton.attr("class", "float-right delete-note");
          noteButton.text("Delete");
          noteLi.prepend(noteButton);
          noteLi.prepend(noteP);

          rowsToAdd.push(noteLi);
        }
        $noteList.prepend(rowsToAdd);


        var $saveNoteBtn = $(".save-note");
        $saveNoteBtn.attr("data-id", article._id);

        $("#myModal").modal("show");
      } else {
        alert("Something went wrong");
      }
    });
}


// When you click the savenote button
$(document).on("click", ".save-note", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  //var thisId = "5c7c9dce23ab2eb2480bfb93";

  var textareaVal = $("#bodyinput").val(); //get the value/text of the text are when button click

  //check the value
  if (textareaVal === "") {
    $("#warning").show(); // if textarea value is empty then show the warning text
  } else {
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {

          body: $("#bodyinput").val()

        }
      })
      // With that done
      .then(function (data) {
        console.log(data);
        refreshArticleNotes(thisId);
      });
  }

  // Also, remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});

// When you click the delete button
$(document).on("click", ".delete-note", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  var articleId = $(this).attr("article-data-id");

  console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "GET",
      url: "/deleteNote/" + thisId
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      refreshArticleNotes(articleId);
      // Empty the notes section
    });
});