$(document).ready(function() {
  // define number of main parties n to display
  // results separately (n+1 bars)
  numberOfMainParties = 3;
  totalSeats = 650;
  seatsToWin = 326;
  parties = [];
  // define colours for main parties
  colours = {
    CON : "#0575c9",
    LAB : "#e91d0e",
    LD : "#f8ed2e",
  }
  // Party class definition
  class Party {
    constructor(partyCode) {
      this.partyCode = partyCode;
      this.votes = 0;
      this.total = 0;
      this.seats = 0;
      this.share = 0;
      partyCode = $(this).text().trim();
      if (partyCode in colours) {
        this.colour = colours[partyCode];
      } else {
        // default colour if party colour undefined
        this.colour = "#aaaaaa";
      }
    }

    add_votes(votes) {
      this.votes += votes;
    }

    update_vote_share(total) {
      this.total += total;
      this.share = parseInt(this.votes/this.total * 100);
    }

    seat_won() {
      this.seats += 1;
    }
  }
  // Event listener for file selector
  $('#uploader').change(function(event) {
    var fileList = event.target.files;
    fileIndex = 0;
    loadAsText(fileList[fileIndex]);

    // event listener to load files sequentially
    $(document).on("click",function() {
      console.log("Clicked: loading next file.");
      fileIndex += 1;
      loadAsText(fileList[fileIndex]);
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
      var constituencyResultXML = loadedEvent.target.result;
      if (fileIndex == 0) {
        parties = createParties(constituencyResultXML);
      }
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
      var partyCode = $(this).text().trim();
      console.log("Creating party: ",partyCode);
      parties[partyCode] = new Party( partyCode );
    })
    return parties;
  }

  function consolidatePartyData(array) {
    // separate major and minor party data
    for (var i=0; i < numberOfMainParties; i++) {
      mainParties = array.slice(0,numberOfMainParties);
      otherParties = array.slice(numberOfMainParties+1);
    }
    console.log(mainParties);
    // create new party object to store consolidated minor party data
    other = new Party('OTH',"#aaaaaa");
    otherParties.forEach( (party) => {
      other.votes += party.votes;
      other.seats += party.seats;
    })
    other.update_vote_share(array[0].total);
    // return array containing the major party and consolidated minor party data
    mainParties.push(other);
    return mainParties;
  }

  function update(response, parties) {
    // Find total votes first so can update overall share of vote
    // for each party
    var total_votes=0;
    console.log("Total votes in this seat: ",total_votes);
    // iterate through results and update each party seats, votes, share
    $(response).find("result").each(function(index) {
      var partyCode = $(this).find("partyCode").text().trim();
      var votes = parseInt($(this).find("votes").text());
      parties[partyCode].add_votes(votes);
      total_votes += votes;
      // winner is first result in list
      console.log("index: ",index);
      if (index==0) {
        console.log("Seat won by: ",partyCode)
        parties[partyCode].seat_won()};
    })
    // update vote share for each party
    for (party in parties) {
      parties[party].update_vote_share(total_votes);
    }
    console.log(parties);

    // convert parties object into ordered array
    // and apply function to separate major and minor party data
    var results_by_seat = consolidatePartyData( Object.values(parties).sort((a,b)=>(b.seats-a.seats)) );
    var results_by_voteshare = consolidatePartyData( Object.values(parties).sort((a,b)=>(b.share-a.share)) );
    console.log(results_by_seat);
    console.log(results_by_voteshare);

    // Create histogram and results table
    var $histogram = $('<div class="histogram"></div>')
    var $tableHeadRow = $('<thead><tr></tr></thead>');
    var $tableBodyRow = $('<tbody><tr></tr></tbody');
    var barContainerWidth = 100/(numberOfMainParties+1) + '%';
    var height = $('.histogram').height();
    console.log(height);
    results_by_seat.forEach(function(party) {
      $barContainer = $('<div class="bar-container"></div').width(barContainerWidth);
      var barHeight = parseInt(party.seats / totalSeats * height);
      $bar = $('<div class="bar"></div>').css('background-color',party.colour).height(barHeight*10);
      $barContainer.append($bar);
      $histogram.append($barContainer);
      $tableHeadRow.append($('<th scope="col"></th>').text(party.partyCode));
      $tableBodyRow.append($('<td></td>').text(party.seats));
    })
    // append seats data to table
    $('.histogram').html($histogram);
    $('.seats-table').html($tableHeadRow);
    $('.seats-table').append($tableBodyRow);
  }  
})

