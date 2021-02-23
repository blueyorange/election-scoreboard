$(document).ready(function () {
  // define number of main parties n to display
  // results separately (n+1 bars)
  var numberOfMainParties = 3;
  var totalSeats = 650;
  var votesTotal = 0;
  var parties = {};
  var currentSeat = 0;
  // Party class definition
  class Party {
    constructor(partyCode) {
      this.seatsToWin = 326;
      this.hasMajority = false;
      this.partyCode = partyCode;
      this.votes = 0;
      this.seats = 0;
      this.share = 0;
      this.lastShare = 0;
      this.partyCode = partyCode;
      // party colours defined in css
    }

    add_votes(votes) {
      this.votes += votes;
    }

    update_vote_share(votesTotal) {
      this.share = this.votes / votesTotal * 100;
      console.log(this.partyCode,this.votes,votesTotal,this.share)
    }

    seat_won() {
      this.seats += 1;
      if (this.seats >= this.seatsToWin) {
        this.hasMajority = true;
      }
    }
  }

  // Event listener for file selector
  $('#uploader').change(function (event) {
    var fileList = event.target.files;
    function loadFile() {
      loadAsText(fileList[currentSeat]);
      currentSeat += 1;
    }

    $('button#auto-start').on("click", function () {
      interval = setInterval(loadFile, 1000);
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
    reader.onload = function (loadedEvent) {
      // New file has been loaded
      // Call function to update data and page
      var constituencyResultXML = loadedEvent.target.result;
      update(constituencyResultXML, parties);
    }
    reader.readAsText(file);
  }

  function consolidatePartyData(array) {
    // This function takes in the ordered array of party data and consolidates
    // the minor party data into a single Party object 'OTH'
    // outputs an array of four Party objects

    // split array to separate major and minor party data
    for (var i = 0; i < numberOfMainParties; i++) {
      mainParties = array.slice(0, numberOfMainParties);
      otherParties = array.slice(numberOfMainParties + 1);
    }
    // create new party object to store consolidated minor party data
    other = new Party('OTH');
    otherParties.forEach((party) => {
      other.votes += party.votes;
      other.seats += party.seats;
    })
    other.update_vote_share(votesTotal);
    // return array containing the major party and consolidated minor party data
    mainParties.push(other);
    return mainParties;
  }

  function update(constituencyResultXML, parties) {
    // Find total votes first so can update overall share of vote
    // for each party
    var results_seat = {};
    // store constituency name
    votesThisSeat = 0;
    // update current seat
    $('#currentSeat')
    // iterate through results and update each party seats, votes, share
    $(constituencyResultXML).find("result").each(function (index) {
      var partyCode = $(this).find("partyCode").text().trim();
      var votes = parseInt($(this).find("votes").text());
      // store results for this seat to be used in third chart
      results_seat[partyCode] = $(this).find("share").text().trim();
      // only update votes if there are votes to update and field is not empty
      if (votes) {
        if (!(partyCode in parties)) {
          // Add party to parties object as not seen before
          parties[partyCode] = new Party(partyCode);
          console.log("New party found: ",partyCode)
        }
        parties[partyCode].add_votes(votes);
        votesThisSeat += votes;
        // winner is first result in list
        if (index == 0) {
          // Update winning seat and winning party html
          $('#constituencyName').text($(constituencyResultXML).find("constituencyName").text().trim());
          $('#party-win').text(partyCode).removeClass().addClass(partyCode);
          parties[partyCode].seat_won();
        }
      }
      votesTotal += votesThisSeat;
    })
    // update vote share for each party
    for (party in parties) {
      parties[party].update_vote_share(votesTotal);
    }

    // convert parties object into ordered array
    // and apply function to separate major and minor party data
    var results_by_seat = consolidatePartyData(Object.values(parties).sort((a, b) => (b.seats - a.seats)));
    var results_by_voteshare = consolidatePartyData(Object.values(parties).sort((a, b) => (b.share - a.share)));

    // VERTICAL BAR CHART - SEATS
    var height = $('.bars-vertical').height();
    // Iterate through results by seat for first chart
    results_by_seat.forEach(function (party, index) {
      // calculate height of new bar
      var barHeight = parseInt(party.seats * height / totalSeats);
      $bar = $(`ul.bars-vertical>li:nth-child(${index + 1})`).first();
      $bar.height(barHeight);
      $bar.attr("data-value", String(party.seats));
      $bar.attr("data-label", party.partyCode);
      // colour is set in stylesheet by css class partyCode
      $bar.removeClass().addClass(`${party.partyCode}`);
      // check if party has won, add winning class if so
      if (party.hasMajority) {
        $bar.addClass('win');
      }
    })

    // HORIZONTAL TABLE CHART - OVERALL VOTESHARE
    // Iterate through results by voteshare
    var $rows = $(`table.results-voteshare>tbody>tr`);
    var maxShare = results_by_voteshare[0].share;

    results_by_voteshare.forEach(function (party, index) {
      var $row = $rows.eq(index);
      $row.children().eq(0).text(party.partyCode);
      $row.children().eq(1).text(String(party.share.toFixed(1)) + '%');
      var $bar = $row.find('div');
      if (index == 0) {
        $bar.width('100%');
      } else {
        $bar.width(String(party.share / maxShare * 100) + '%');
      }
      // add party class to bar to ensure correct colour
      $bar.removeClass().addClass('h-bar '+party.partyCode);
    })
  }
})
