$(document).ready(function () {
  // define number of main parties n to display
  // results separately (n+1 bars)
  var numberOfMainParties = 3;
  var totalSeats = 650;
  var votesTotal = 0;
  var parties = {};
  var currentSeat = 0;
  seatsToWin = 326;
  // File loads one per second
  var fileLoadInterval = 10;
  interval = false;
  // Party class definition
  class Party {
    constructor(partyCode) {
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
    }

    seat_won() {
      this.seats += 1;
      if (this.seats >= seatsToWin) {
        this.hasMajority = true;
      }
    }
  }

  // check if file API supported
  if (window.FileList) {
    console.log("File APIs supported by browser.")
  } else {
    alert("The File APIs are not fully supported in this browser.");
  }

  // Event listener for file selector
  $('#uploader').change(function (event) {
    var fileList = event.target.files;
    // update number of seats according to number of files in list
    totalSeats = fileList.length;
    console.log( $('ul.bars-vertical').height() )
    // over half number of seats needed to win
    seatsToWin = Math.floor(totalSeats / 2)+1
    console.log(seatsToWin)
    $('#totalSeats').text(totalSeats);
    // update position of seatpost according to height of histogram
    let top = String($('ul.bars-vertical').height() * (1- seatsToWin / totalSeats) )+'px';
    let bottom = String($('ul.bars-vertical').height() - seatsToWin / totalSeats) +'px';
    console.log('top ',top);
    $('div#seatpost').css('top',top)
    $('div#seatpost').css('bottom',bottom)
    function loadFile() {
      loadAsText(fileList[currentSeat]);
    }

    // event listener for click
    $(document).on('click', function (event) {
      // if button is clicked auto-run
      if (event.target.id == 'auto-start') {
        if (!interval) interval = setInterval(loadFile, fileLoadInterval);
      } else {
        // stop auto-run if clicked anywhere else
        clearInterval(interval);
        interval = false;
        loadFile();
      }
    })
  })

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
      otherParties = array.slice(numberOfMainParties);
    }
    console.log(mainParties);
    console.log(otherParties);
    // create new party object to store consolidated minor party data
    other = new Party('OTHER');
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
    currentSeat += 1;
    // Reads data from XML file and updates parties object
    votesThisSeat = 0;
    // update current seat
    $('#currentSeat').text(currentSeat);
    // iterate through results and update each party seats, votes, share
    $(constituencyResultXML).find("result").each(function (index) {
      var partyCode = $(this).find("partyCode").text().trim();
      console.log(partyCode);
      var votes = parseInt($(this).find("votes").text());
      // only update votes if there are votes to update and field is not empty
      if (votes) {
        if (!(partyCode in parties)) {
          // Add party to parties object as not seen before
          parties[partyCode] = new Party(partyCode);
          console.log("New party found: ", partyCode)
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
    })
    // update vote share for each party
    console.log("Votes this seat: ", votesThisSeat);
    votesTotal += votesThisSeat;
    console.log('Total votes = ',votesTotal);
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
      $bar.removeClass().addClass('DEFAULT ' + party.partyCode);
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
      $row.children().eq(1).text(String(party.share.toFixed(1) + '%'));
      var $bar = $row.find('div');
      if (index == 0) {
        $bar.width('100%');
      } else {
        $bar.width(String(party.share / maxShare * 100) + '%');
      }
      // add party class to bar to ensure correct colour
      $bar.removeClass().addClass('h-bar ' + ' DEFAULT ' + party.partyCode);
    })
  }
})
