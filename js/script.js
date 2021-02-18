$(document).ready(function() {
  // Party class definition
  class Party {
    constructor(partyCode,partyColour) {
      this.partyCode = partyCode;
      this.votes = 0;
      this.votes_total = 0;
      this.seats = 0;
      this.share = 0;
      this.position = 1;
      // default color is grey
      this.colour = partyColour;
    }

    add_votes(votes) {
      this.votes += votes;
      this.share = parseInt(this.votes/this.total * 100);
    }

    seat_won() {
      seats += 1;
    }
  }
  // Event listener for file selector
  $('#uploader').change(function(event) {
    var fileList = event.target.files;
    loadAsText(fileList[0]);
    $('document').click(function() {
      console.log("Clicked: loading next file.")
    })
  })

  // check if file API supported
  if (window.FileList) {
    console.log("File APIs supported by browser.")
  } else {
    alert("The File APIs are not fully supported in this browser.");
  }

  // load file from list
  function loadAsText(file) {
    // Create FileReader object
    var reader = new FileReader();
    reader.onload = function(loadedEvent) {
      // New file has been loaded
      // Call function to update data and page
      createParties(loadedEvent.target.result);
      update(loadedEvent.target.result);
    }
    reader.readAsText(file);
  }

  function createParties(firstResult) {
    // Takes the first constituency result and returns
    // an array of party objects with correct partyCodes
    // and colours
    parties = []
    colours = {
      CON : "#0575c9",
      LAB : "#e91d0e",
      LD : "#f8ed2e",
      other : "#aaaaaa"
    }
    parties = []
    $(firstResult).find("partyCode").each(function() {
      partyCode = $(this).text().trim();
      if (partyCode in colours) {
        var colour = colours[partyCode];
      } else {
        var colour = colours['other'];
      }
      parties.push(new Party($(this).text(),colour));
    })
    return parties;
  }

})

function update(response) {
  $(response).find("result").each(function () {
    parties.forEach(function (party, index) {
      party.partyCode = $(this).find("partycode").text();
      party.add_votes($(this).find("votes").text());
    })
    // Create head and body of seats table
    var $tableHeadRow = $('<thead><tr></tr></thead>');
    var $tableBodyRow = $('<tbody><tr></tr></tbody');
    parties.forEach(function(party,index) {
      $tableHeadRow.append($('<th scope="col"></th>').text(party.partyCode));
      $tableBodyRow.append($('<td></td>').text(party.seats));
    })
    // append seats data to table
    $('.seats-table').append($tableHeadRow)
    $('.seats-table').append($tableBodyRow)
  })
}
