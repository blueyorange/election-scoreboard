$(document).ready(function() {
  // define colours for main parties
  colours = {
    CON : "#0575c9",
    LAB : "#e91d0e",
    LD : "#f8ed2e",
    OTH : "#aaaaaa"
  }
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
      var constituencyResultXML = loadedEvent.target.result
      parties = createParties(constituencyResultXML);
      update(constituencyResultXML, parties);
    }
    reader.readAsText(file);
  }

  function createParties(firstResult) {
    // Takes the first constituency result and returns
    // an object of party objects with correct partyCodes
    // and colours
    var parties = {};
    $(firstResult).find("partyCode").each(function() {
      partyCode = $(this).text().trim();
      if (partyCode in colours) {
        var colour = colours[partyCode];
      } else {
        var colour = colours['OTH'];
      }
      parties[partyCode] = new Party(partyCode,colour));
    })
    return parties;
  }

})

function update(response, parties) {
  // map object to store results for one seat
  // map objects have ordered elements so winning
  // seat can be easily retrieved as first in list
  var results = new Map;
  $(response).find("result").each(function(index, value) {
    var partyCode = $(this).find("partyCode").text().trim();
    var votes = parseInt($(this).find("votes").text());
    parties[partyCode].add_votes(votes);
    // winner is first result
    if (index==0) {parties[partyCode].seat_won};
  })
  // Update party objects
  parties.forEach(function (party, index) {
    party.
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
