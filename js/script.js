$(document).ready(function() {
  // define number of main parties n to display
  // results separately (n+1 bars)
  var numberOfMainParties = 3;
  var totalSeats = 650;
  var seatsToWin = 326;
  var votesTotal = 0;
  var parties = {};
  var currentSeat = 0;
  // Party class definition
  class Party {
    constructor(partyCode) {
      this.partyCode = partyCode;
      this.votes = 0;
      this.seats = 0;
      this.share = 0;
      this.partyCode = partyCode;
      // party colours defined in css
    }

    add_votes(votes) {
      this.votes += votes;
    }

    update_vote_share() {
      this.share = parseInt(this.votes/votesTotal * 100);
    }
    seat_won() {
      this.seats += 1;
    }
  }
  // Event listener for file selector
  $('#uploader').change(function(event) {
    var fileList = event.target.files;

    // event listener to load files sequentially
    $(document).on("click",function() {
      console.log("Clicked: loading next file.");
      loadAsText(fileList[currentSeat]);
      currentSeat += 1;
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
      update(constituencyResultXML, parties);
    }
    reader.readAsText(file);
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
    var votes_this_seat=0;
    // iterate through results and update each party seats, votes, share
    $(response).find("result").each(function(index) {
      var partyCode = $(this).find("partyCode").text().trim();
      var votes = parseInt($(this).find("votes").text());
      if (!(partyCode in parties)) {
        // Add party to parties object as not seen before
        parties[partyCode] = new Party(partyCode);
      }
      parties[partyCode].add_votes(votes);
      votes_this_seat += votes;
      // winner is first result in list
      console.log("index: ",index);
      if (index==0) {
        console.log("Seat won by: ",partyCode)
        parties[partyCode].seat_won()};
    })
    votesTotal += votes_this_seat;
    // update vote share for each party
    for (party in parties) {
      parties[party].update_vote_share();
    }
    console.log(parties);

    // convert parties object into ordered array
    // and apply function to separate major and minor party data
    var results_by_seat = consolidatePartyData( Object.values(parties).sort((a,b)=>(b.seats-a.seats)) );
    var results_by_voteshare = consolidatePartyData( Object.values(parties).sort((a,b)=>(b.share-a.share)) );
    console.log(results_by_seat);
    console.log(results_by_voteshare);

    // Create histogram and results table
    $('#seats').text(currentSeat);
    var height = $('.bars-vertical').height();
    console.log(height);
    results_by_seat.forEach(function(party,index) {
      // calculate height of new bar
      var barHeight = parseInt(party.seats * height / totalSeats);
      $bar = $(`ul.bars-vertical>li:nth-child(${index+1})`).first();
      console.log($bar.length);
      $bar.height(barHeight);
      $bar.attr("data-value",String(party.seats));
      $bar.attr("data-label",party.partyCode);
      $bar.removeClass();
      $bar.addClass(`bar-${party.partyCode}`);
    })
  }  
})

