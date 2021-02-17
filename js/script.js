class Party {
  constructor(partyCode) {
    this.partyCode = partyCode;
    this.votes = 0;
    this.seats = 0;
    this.share = 0;
    this.position = 1;
  }

  add_votes(votes) {
    this.votes += votes;
  }

  seat_won() {
    seats += 1;
  }
}

$(document).ready(function {
  var parties = [];
  getData(parties);
})

function getData(parties) {
  // read local xml files using ajax
  $.ajax({
    type: "GET",
    url: "./data/result001.xml",
    dataType: "xml",

    error: function (e) {
      alert("An error occurred when trying to process XML file.");
      console.log("Error reading XML: ", e);
    },

    success: function(response) {
      for
      $(response).find("result").each(function () {
        var partyCode = ''
      })
    }
  })
}
