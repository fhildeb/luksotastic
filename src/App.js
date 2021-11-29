// Core App related imports
import React from 'react';
import { Link } from 'react-scroll';
import './App.css';

// EVM blockchain related imports
import Web3 from 'web3';
import { ERC725 } from '@erc725/erc725.js';

/**
 * LUKSO related interfaces and schemas
 * for smart contracts and their functions
 */

// IPFS gateway address
import Config from './schemas/Config.schema.js';

// LSP1 Interface: Universal Receiver Address Store
import LSP1 from './interfaces/LSP1.json';

// LSP8 Interface: Inproved Non Fungible Token
import LSP8 from './interfaces/LSP8.json';

// Depricated LSP4 Interface: Old Digital Certificate Metadata
import LSP4D from './interfaces/LSP4D.json';

// Schema to fetch Contract Types
import InterfaceID from './schemas/InterfaceID.schema.js';

// Schema for the Identity Standard
import ERC725schema from './schemas/ERC725.schema.js';

// Schema for the Digital Certificate Metadata Standard
import LSP4schema from './schemas/LSP4.schema.js';

// LUKSOTASTIC Interfaces for own smart contracts
import ProfileInteraction from './interfaces/ProfileInteraction.json';

// Provider variable for the ERC725 contract initialization
const provider = new Web3.providers.HttpProvider(
  'https://rpc.l14.lukso.network',
);

// Contract address of the LUKSOTSTIC smart contract
const backendAddress = '0x6C658BAbE464f5cBd6cBc00eDb4523350321085A';

// Contract address of the example profile
const sampleAddress = '0x0C03fBa782b07bCf810DEb3b7f0595024A444F4e';

// Initial state variables of the application on navigation
const initialState = {
  // Errorhandlers
  walleterror: 'Loading blockchain information',
  inputerror: 'No Universal Profile provided',

  // Addresses to fetch data
  address: '',
  receiver: '',

  // Frontend input
  input: '',

  // Profile data
  name: 'NAME',
  description: 'DESCRIPTION',
  balance: '0',
  userBalance: '0',

  // Contract stats
  totalSupply: 0,
  activeUsers: 0,

  // Internal variables
  firstLauch: false,
  enabled: false,
};

/**
 * LUKSOTASTIC Application
 *
 * @author fhildeb
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  /**
   * When webcomponents from render()
   * are displayed correctly, this function
   * will be called to execute JS code.
   */
  componentDidMount = async () => {
    // ACCESSING METAMASK

    // Initiate a wallet provider for older browsers
    let web3Provider;
    web3Provider = window.ethereum;

    // For modern browsers
    if (window.ethereum) {
      try {
        await Web3.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        if (error.code === 4001) {
          // User rejected request
        }
      }
    }
    // For old browsers
    else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    }
    // Default
    else {
      this.logMetaMask('Please install MetaMask');
      return;
    }

    /**
     * Accessing LUKSO Network
     */

    //create web3 wrapper for ethereum modules
    const web3 = new Web3(web3Provider);

    // Compare network ID´s and hosts
    this.updateNetwork();

    // Refresh if permission request is still pending
    if (this.state.metamask === 'Loading information') {
      this.refreshPage();
    }
    // Balances and network updates every 2 seconds
    this.setState({ web3 }, () => {
      this.updateNetwork();
      setInterval(() => {
        this.updateNetwork();
      }, 2 * 1000);
    });
  };

  /**
   * Will render all tags from React
   * into one webpage and binding the
   * state letiables into the frontend.
   *
   * Formatting is done with CSS
   * in ./App.css
   */
  render = () => {
    // Used variables from app class
    const {
      walleterror,
      inputerror,
      name,
      description,
      balance,
      userBalance,
      totalSupply,
      activeUsers,
    } = this.state;
    return (
      <div className="App">
        <div className="MenuBar" id="menuBar">
          <div className="Head" onClick={() => this.navigate(0)}>
            Documentation
          </div>
          <div className="Head" onClick={() => this.navigate(1)}>
            Search
          </div>
          <div className="Head" onClick={() => this.navigate(2)}>
            Explore
          </div>
          <div className="Head" onClick={() => this.navigate(3)}>
            Sample
          </div>
          <div className="Head" onClick={() => this.addTokenLogo()}>
            Import Token
          </div>
        </div>
        <div className="MenuBarDisabled" id="menuBarDisabled">
          <div className="Head" onClick={() => this.navigate(0)}>
            Documentation
          </div>
          <div className="HeadDisabled">Search</div>
          <div className="HeadDisabled">Explore</div>
          <div className="HeadDisabled">Sample</div>
          <div className="Head" onClick={() => this.addTokenLogo()}>
            Import Token
          </div>
        </div>
        <img className="Logo" src="./luksotastic_trans.png" alt=""></img>
        <div id="documentation" className="Nav">
          <div id="documentationHeader" className="DocumentationHeader">
            <div className="DocumentationContent">
              <div className="Headline Bright">
                Your lightway social media platform featuring it's social
                currency.
              </div>
              <div className="Bright">
                React to NFT's, earn reputation or explore and support great
                collectors!
              </div>
            </div>
            <img
              className="DocumentationImg"
              src="./luksotastic_doc_img_2.png"
              alt=""
            ></img>
          </div>
          <div id="documentationBody" className="DocumentationBody">
            <div className="DocumentationList">
              <div className="Left">
                <div className="DocumentationWrapper">
                  <div className="Headline Dark ListText">UPVOTE:</div>
                  <div className="Dark ListText">
                    This type of interaction will give you 2 LSTC and the
                    asset's owner 8 LSTC and will rank the asset on the endless
                    leaderboard of total upvotes earned.
                  </div>
                  <div className="Headline Dark ListText">HYPE UP:</div>
                  <div className="Dark ListText">
                    This type of interaction will give you 1 LSTC and the
                    asset's owner 12 LSTC and will rank the asset on the weekly
                    leaderboard of current hypes.
                  </div>
                  <div className="Headline Dark ListText">SUPPORT:</div>
                  <div className="Dark ListText">
                    With this type of interaction you are giving away 10 LSTC to
                    altruistically support a new or small account with the
                    massive amount of 20 LSTC.
                  </div>
                </div>
              </div>
              <img
                className="ListImg "
                src="./luksotastic_doc_img_1.png"
                alt=""
              ></img>
            </div>
          </div>
          <div id="documentationFooter" className="DocumentationFooter">
            <div className="DocumentationContent">
              <div className="Headline Bright">What are you waiting for?!</div>
              <div className="Bright">
                Connect to MetaMask to login and interact with others.
              </div>
            </div>
            <div>
              <div
                className="DocumentationButton"
                onClick={() =>
                  window
                    .open('https://metamask.io/download.html', '_blank')
                    .focus()
                }
              >
                Download MetaMask
              </div>
            </div>
            <div>
              <div
                className="DocumentationButton"
                onClick={() => this.addLuksoTestnet()}
              >
                Add the LUKSO L14 to MetaMask
              </div>
            </div>
            <div>
              <div
                className="DocumentationButton"
                onClick={() => this.refreshPage()}
              >
                Start Your Social Media Experience
              </div>
            </div>
          </div>
        </div>
        <div id="search" className="Nav">
          <div className="WalletStatusContainer">
            <div className="WalletStatusBar">
              <div className="WalletStatusLeft">
                <img
                  className="MetamaskPicture"
                  alt="MetaMask"
                  src="./metamask_logo.png"
                ></img>
              </div>
              <div className="WalletStatusRight">
                <p>{walleterror}</p>
              </div>
              <p>
                <br />
                <br />
                You currently have {userBalance} LSTC
              </p>
            </div>
          </div>
          <div id="inputContainer" className="InputContainer">
            <form autoComplete="off">
              <input
                value={this.state.value}
                onChange={(event) => this.updateInput(event)}
                type="text"
                id="inputAddressField"
              ></input>
            </form>
            <button
              className="FetchButton"
              onClick={() => this.fetchData('custom')}
            >
              <span>fetch Profile</span>
            </button>
          </div>
          <div id="inputErrorText" className="InputErrorText">
            {inputerror}
          </div>
          <div className="ProfileArea">
            <div className="ProfileDescription">
              <div className="DescriptionText ">{description}</div>
            </div>
          </div>
          <div className="ProfileDisplay">
            <img
              id="backgroundImage"
              className="ProfileBackground"
              src="./blank.png"
              alt=""
            ></img>
            <div className="ProfileWing">@{name}</div>
            <div className="Spacer"></div>
            <div className="ProfileWing">{balance} LSTC</div>
          </div>
          <div className="Spacer"></div>
          <div className="SeperatorBlock">
            <img
              id="profileImage"
              className="ProfilePicture"
              src="./blank.png"
              alt=""
            ></img>
          </div>
          <div className="AssetArea"></div>
        </div>
        <div id="explore" className="Nav">
          <div id="exploreHeader" className="ExploreHeader">
            <div className="Headline Bright">Overview</div>
          </div>
          <hr className="BrightHR"></hr>
          <div id="exploreHeaderContent" className="DarkContent">
            <Link className="Submenu" to="topUpvotes" spy={true} smooth={true}>
              TOP UPVOTED
            </Link>
            <Link className="Submenu" to="topHypes" spy={true} smooth={true}>
              TOP HYPED
            </Link>
            <Link className="Submenu" to="topSupports" spy={true} smooth={true}>
              TOP SUPPORTED
            </Link>
            <Link className="Submenu" to="topBalances" spy={true} smooth={true}>
              TOP ACCOUNTS
            </Link>
            <div className="BigStats">
              <div className="LeftStat">LSTC CREATED:</div>
              <div className="RightStat">{totalSupply}</div>
            </div>
            <div className="BigStats">
              <div className="LeftStat"> ACTIVE USERS:</div>
              <div className="RightStat">{activeUsers}</div>
            </div>
          </div>
          <div name="topUpvotes" id="exploreBodyA" className="ExploreBody">
            <div className="Headline Dark">Most upvoted assets of all time</div>
          </div>
          <hr className="DarkHR"></hr>
          <div id="exploreBodyAContent" className="BrightContent"></div>
          <div name="topHypes" id="exploreBodyB" className="ExploreBody">
            <div className="Headline Dark">Most hyped assets this week</div>
          </div>
          <hr className="DarkHR"></hr>
          <div id="exploreBodyBContent" className="BrightContent"></div>
          <div name="topSupports" id="exploreBodyC" className="ExploreBody">
            <div className="Headline Dark">
              Most supported assets this month
            </div>
          </div>
          <hr className="DarkHR"></hr>
          <div id="exploreBodyCContent" className="BrightContent"></div>
          <div name="topBalances" id="exploreFooter" className="ExploreFooter">
            <div className="Headline Bright">Most valuable accounts</div>
          </div>
          <hr className="BrightHR"></hr>
          <div id="exploreFooterContent" className="DarkContentProfile"></div>
        </div>
        <div id="sample" className="Nav"></div>
      </div>
    );
  };

  /**
   * INTERFACE
   */

  /**
   * Manually refresh Page
   * from frontend
   */
  refreshPage = () => {
    window.location.reload();
  };

  /**
   * Navigate through the different content sites
   * of the one-page application
   *
   * @param {*} id documentation (0), search (1), explore (2), sample (3)
   */
  navigate = (id) => {
    switch (id) {
      case 0:
        // Navigate to Documentation page
        this.hideElement('search');
        this.hideElement('explore');
        this.hideElement('exploreHeader');
        this.hideElement('exploreHeaderContent');
        this.hideElement('exploreBodyA');
        this.hideElement('exploreBodyAContent');
        this.hideElement('exploreBodyB');
        this.hideElement('exploreBodyBContent');
        this.hideElement('exploreBodyC');
        this.hideElement('exploreBodyCContent');
        this.hideElement('exploreFooter');
        this.hideElement('exploreFooterContent');
        this.showElement('documentation');
        this.showElement('documentationHeader');
        this.showElement('documentationBody');
        this.showElement('documentationFooter');
        break;
      case 1:
        // Navigate to search panel
        this.hideElement('documentation');
        this.hideElement('documentationHeader');
        this.hideElement('documentationBody');
        this.hideElement('documentationFooter');
        this.hideElement('explore');
        this.hideElement('exploreHeader');
        this.hideElement('exploreHeaderContent');
        this.hideElement('exploreBodyA');
        this.hideElement('exploreBodyAContent');
        this.hideElement('exploreBodyB');
        this.hideElement('exploreBodyBContent');
        this.hideElement('exploreBodyC');
        this.hideElement('exploreBodyCContent');
        this.hideElement('exploreFooter');
        this.hideElement('exploreFooterContent');
        this.showElement('search');
        this.showElement('inputContainer');
        this.showElement('inputErrorText');
        this.resetState();
        this.resetView();
        break;
      case 2:
        // Navigate to Explore page
        this.hideElement('documentation');
        this.hideElement('documentationHeader');
        this.hideElement('documentationBody');
        this.hideElement('documentationFooter');
        this.hideElement('search');
        this.showElement('explore');
        this.showElement('exploreHeader');
        this.showElement('exploreHeaderContent');
        this.showElement('exploreBodyA');
        this.showElement('exploreBodyAContent');
        this.showElement('exploreBodyB');
        this.showElement('exploreBodyBContent');
        this.showElement('exploreBodyC');
        this.showElement('exploreBodyCContent');
        this.showElement('exploreFooter');
        this.showElement('exploreFooterContent');
        this.loadAppStats();
        this.loadExplorePage();
        this.resetView();
        break;
      case 3:
        // Execute Sample without input UI
        this.navigate(1);
        this.hideElement('inputContainer');
        this.hideElement('inputErrorText');
        this.fetchData('sample');
        break;
      default:
        this.refreshPage();
    }
  };

  /**
   * Reset the veiw of page elements that were
   * changed or added from past interactions
   */
  resetView = () => {
    // Reset profile picture and background for next search
    document.getElementById('profileImage').src = './blank.png';
    document.getElementById('backgroundImage').src = './blank.png';

    // Delete regular assets
    let elements = document.getElementsByClassName('Asset');
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }

    // Delete locked assets
    elements = document.getElementsByClassName('LockedAsset');
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }

    // Delete profiles
    elements = document.getElementsByClassName('Profile');
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  };

  /**
   * Hide content element from the webpage
   *
   * @param {*} element HTML element ID
   */
  hideElement = (element) => {
    document.getElementById(element).style.display = 'none';
  };

  /**
   * Show content element from the webpage
   *
   * @param {*} element HTML element ID
   */
  showElement = (element) => {
    document.getElementById(element).style.display = 'block';
  };

  /**
   * INTERNAL STATE
   */

  /**
   * Reset all state variables related to user
   * interaction from past interactions
   */
  resetState = () => {
    this.logMetaMask(initialState.walleterror);
    this.logInputError(initialState.inputerror);
    this.setAddress(initialState.address);
    this.setName(initialState.name);
    this.setDescription(initialState.description);
    this.setReceiver(initialState.receiver);
    this.setBalance(initialState.balance);
    this.setUserBalance(initialState.userBalance);
  };

  /**
   * Save wallet related errors to state
   *
   * @param {raw string} walleterror Error from MetaMask
   */
  logMetaMask = (walleterror) => {
    this.setState({
      walleterror: String((walleterror || {}).metamask || walleterror),
    });
  };

  /**
   * Save input related errors to state
   *
   * @param {raw string} inputerror Error from input
   */
  logInputError = (inputerror) => {
    this.setState({ inputerror: String(inputerror) });
  };
  /**
   * Save name of profile-owner to state
   *
   * @param {raw string} name Name of universal profile
   */
  setName = (name) => {
    this.setState({ name: String(name) });
  };

  /**
   * Save balance of Universal Profile
   *
   * @param {raw string} balance App token supply of profile
   */
  setBalance = (balance) => {
    this.setState({ balance: String(balance) });
  };

  /**
   * Save balance of Universal Profile
   *
   * @param {raw string} totalSupply Total app token supply
   */
  setTotalSupply = (amount) => {
    this.setState({ totalSupply: amount });
  };

  /**
   * Save balance of Universal Profile
   *
   * @param {raw string} activeUsers Total amount of app users
   */
  setActiveUsers = (activeUsers) => {
    this.setState({ activeUsers: activeUsers });
  };

  /**
   * Save balance of MetaMask Account
   *
   * @param {raw string} balance LYXt Account balance
   */
  setUserBalance = (balance) => {
    this.setState({ userBalance: String(balance) });
  };

  /**
   * Save if app is launched already
   *
   * @param {boolean} firstLaunch Was first launch executed?
   */
  setFirstLaunch = (bool) => {
    this.setState({ firstLauch: bool });
  };

  /**
   * Save if app has MetaMask enabled
   *
   * @param {boolean} enabled Was first launch executed?
   */
  setEnabled = (bool) => {
    this.setState({ enabled: bool });
  };

  /**
   * Save address of profile
   *
   * @param {raw string} address Profile address
   */
  setAddress = (address) => {
    this.setState({ address: String(address) });
  };

  /**
   * Save description of profile owner
   *
   * @param {raw string} description Profile description
   */
  setDescription = (description) => {
    this.setState({ description: String(description) });
  };

  /**
   * Save LSP1 address of profile to state
   *
   * @param {raw string} receiver Receiver address of profile
   */
  setReceiver = (receiver) => {
    this.setState({ receiver: String(receiver) });
  };

  /**
   * Update user's input on listener event
   *
   * @param {Object Event} event Triggering event
   */
  updateInput(event) {
    this.setState({ input: event.target.value });
  }

  /**
   * FRONTEND
   */

  /**
   * Lock support button if the current MetaMask wallet
   * has <10 LSTC. The function will require this amount
   * otherwise the button wont work anyways.
   *
   * @param {string array} digitalAssets all asset's addresses
   */
  lockSupport = (digitalAssets) => {
    // Check balance from state
    if (this.state.userBalance < 10) {
      // Disable all assets on the page
      for (let i = 0; i < digitalAssets.length; i++) {
        // Exclude placeholders, because they have disabled interactions and no unique ID's
        if (digitalAssets[i] !== '0x0000000000000000000000000000000000000000') {
          try {
            // Change design of the asset's support area
            document.getElementById(
              'supportStatLine' + digitalAssets[i],
            ).className = 'StatLineDisabled';

            // Disable support button
            document.getElementById('support' + digitalAssets[i]).className =
              'InteractionDisabled';
            document
              .getElementById('support' + digitalAssets[i])
              .setAttribute('disabled', 'disabled');
          } catch (err) {
            // Asset was received but not owned anymore
          }
        }
      }
    }
  };

  /**
   * Lock an asset's functionalities and change its
   * design on the frontend if the user has already
   * interacted with it before
   */
  lockAssets = async (digitalAssets) => {
    try {
      // Iterate throught all assets
      for (let i = 0; i < digitalAssets.length; i++) {
        // Exclude placeholders, because they have disabled interactions and no unique ID's
        if (digitalAssets[i] !== '0x0000000000000000000000000000000000000000') {
          let checkLock = await this.checkLockedInteraction(digitalAssets[i]);
          if (checkLock) {
            document.getElementById(digitalAssets[i]).className = 'LockedAsset';

            // Disable upvote elements
            document.getElementById(
              'upvoteStatLine' + digitalAssets[i],
            ).className = 'StatLineDisabled';
            document.getElementById('upvote' + digitalAssets[i]).className =
              'InteractionDisabled';
            document
              .getElementById('upvote' + digitalAssets[i])
              .setAttribute('disabled', 'disabled');

            // Disable hype elements
            document.getElementById(
              'hypeStatLine' + digitalAssets[i],
            ).className = 'StatLineDisabled';
            document.getElementById('hype' + digitalAssets[i]).className =
              'InteractionDisabled';
            document
              .getElementById('hype' + digitalAssets[i])
              .setAttribute('disabled', 'disabled');

            // Disable support elements
            document.getElementById(
              'supportStatLine' + digitalAssets[i],
            ).className = 'StatLineDisabled';
            document.getElementById('support' + digitalAssets[i]).className =
              'InteractionDisabled';
            document
              .getElementById('support' + digitalAssets[i])
              .setAttribute('disabled', 'disabled');
          }
        }
      }
    } catch (err) {
      // Asset was received but not owned anymore
    }
  };

  /**
   * Locks the app menu to the Documentation
   * page if MetaMask is not enabled
   */
  lockApp = () => {
    this.hideElement('menuBar');
    this.showElement('menuBarDisabled');
  };

  /**
   * Unlocks the app menu if MetaMask
   * is enabled
   */
  unlockApp = () => {
    this.hideElement('menuBarDisabled');
    this.showElement('menuBar');
  };

  /**
   * Building the Explore page of the application by
   * loading all asset addresses and generating/changing
   * their frontends
   */
  loadExplorePage = async () => {
    // Load all asset addresses
    let assetAddressesUpvote = await this.loadStatistics(0);
    let assetAddressesHype = await this.loadStatistics(1);
    let assetAddressesSupport = await this.loadStatistics(2);
    let profileAddressesBalances = await this.loadStatistics(3);

    // Adding all top upvoted assets to the explore page
    await this.createAssetFrontend(
      assetAddressesUpvote,
      'exploreBodyAContent',
      'id',
      'ranking',
    );

    // Adding all top hypeed assets to the explore page
    await this.createAssetFrontend(
      assetAddressesHype,
      'exploreBodyBContent',
      'id',
      'ranking',
    );

    // Adding all top upvoted assets to the explore page
    await this.createAssetFrontend(
      assetAddressesSupport,
      'exploreBodyCContent',
      'id',
      'ranking',
    );

    // Adding all top accounts with mac balance to the explore page
    await this.createProfileFrontend(profileAddressesBalances);

    // Formating to show Profiles correctly
    document.getElementsByClassName('DarkContentProfile')[0].style.marginTop =
      '23px';

    // Combining all assets of the top lists
    let allAssetAddresses = [];
    let u = 0;
    for (let a = 0; a <= 8; a++) {
      allAssetAddresses[u] = assetAddressesUpvote[a];
      u++;
    }
    for (let b = 0; b <= 8; b++) {
      allAssetAddresses[u] = assetAddressesHype[b];
      u++;
    }
    for (let c = 0; c <= 8; c++) {
      allAssetAddresses[u] = assetAddressesSupport[c];
      u++;
    }
    try {
      // Lock all assets were the account already interacted with
      await this.lockAssets(allAssetAddresses);
    } catch (err) {
      // Asset was received but not owned anymore
    }

    // Lock Support interaction if needed
    this.lockSupport(allAssetAddresses);
  };

  /**
   * Create the frontend for an array
   * of profile address
   *
   * @param {raw string} profileAddresses Array of profile blockchain addresses
   */
  createProfileFrontend = async (profileAddresses) => {
    try {
      // Generate frontend for all addresses
      for (let i = 0; i < profileAddresses.length; i++) {
        if (
          // If the rank is empty, load placeholder profile
          profileAddresses[i] === '0x0000000000000000000000000000000000000000'
        ) {
          // Create frontend of the profile
          let temp = document.createElement('div');
          temp.className = 'Profile';
          temp.innerHTML =
            `<div class="ProfileArea">` +
            `<div class="ProfileDescription">` +
            `<div class="ProfileRank">RANK ${i + 1}: </div>` +
            `<div class="BlockchainAddress">ADDRESS EMPTY</div>` +
            `<div class="DescriptionText ">DESCRIPTION</div>` +
            `</div>` +
            `</div>` +
            `<div class="ProfileDisplay">` +
            `<img id="backgroundImage" class="ProfileBackground" src="./blank.png" alt="" ></img>` +
            `<div class="ProfileWing">NAME EMPTY</div>` +
            `<div class="Spacer"></div>` +
            `<div class="ProfileWing">0 LSTC</div>` +
            `</div>` +
            `<div class="Spacer"></div>` +
            `<div class="SeperatorBlock Round">` +
            `<img id="profileImage" class="ProfilePicture" src="./blank.png" alt="" ></img>` +
            `</div>`;

          // Add profile frontend to the explore page
          document.getElementById('exploreFooterContent').appendChild(temp);
        } else {
          // Rank has an address
          try {
            // Create instance of ERC725 account
            const erc725 = new ERC725(
              ERC725schema,
              profileAddresses[i],
              provider,
              Config,
            );

            // Fetch data of the profile address
            const fetchedData = await erc725.fetchData();

            // Get background images
            let rawBGPictures = [];
            for (let i in fetchedData.LSP3Profile.LSP3Profile.backgroundImage) {
              let baseurl = 'https://ipfs.lukso.network/ipfs/';
              rawBGPictures.push([
                i,
                baseurl +
                  fetchedData.LSP3Profile.LSP3Profile.backgroundImage[
                    i
                  ].url.substring(7),
              ]);
            }

            // Get profile pictures
            let rawPFPictures = [];
            for (let i in fetchedData.LSP3Profile.LSP3Profile.profileImage) {
              let baseurl = 'https://ipfs.lukso.network/ipfs/';
              rawPFPictures.push([
                i,
                baseurl +
                  fetchedData.LSP3Profile.LSP3Profile.profileImage[
                    i
                  ].url.substring(7),
              ]);
            }

            // Get name and description
            let name = fetchedData.LSP3Profile.LSP3Profile.name;
            let description = fetchedData.LSP3Profile.LSP3Profile.description;

            // Enable Web3
            const { web3 } = this.state;

            // Create instance of the LUKSOTASTIC contract
            const Luksotastic = new web3.eth.Contract(
              ProfileInteraction,
              backendAddress,
            );

            // Get their account balance of LSTC
            let balance = await Luksotastic.methods
              .balanceOf(profileAddresses[i])
              .call();

            // Update profile and background
            let image = rawPFPictures[0][1];
            let background = rawBGPictures[0][1];

            // Create frontend of the profile
            let temp = document.createElement('div');
            temp.className = 'Profile';
            temp.innerHTML =
              `<div class="ProfileArea">` +
              `<div class="ProfileDescription">` +
              `<div class="ProfileRank">RANK ${i + 1}: </div>` +
              `<div class="BlockchainAddress">${profileAddresses[i]}</div>` +
              `<div class="DescriptionText ">${description}</div>` +
              `</div>` +
              `</div>` +
              `<div class="ProfileDisplay">` +
              `<img id="backgroundImage" class="ProfileBackground" src="${background}" alt="" ></img>` +
              `<div class="ProfileWing">${name}</div>` +
              `<div class="Spacer"></div>` +
              `<div class="ProfileWing">${balance} LSTC</div>` +
              `</div>` +
              `<div class="Spacer"></div>` +
              `<div class="SeperatorBlock Round">` +
              `<img id="profileImage" class="ProfilePicture" src="${image}" alt="" ></img>` +
              `</div>`;

            // Add profile frontend to the explore page
            document.getElementById('exploreFooterContent').appendChild(temp);
          } catch (err) {
            // Profile address was set but is MetaMask wallet instead of an profile

            // Enable Web3
            const { web3 } = this.state;

            // Create instance of LUKSOTASTIC contract
            const Luksotastic = new web3.eth.Contract(
              ProfileInteraction,
              backendAddress,
            );

            // Get account balance
            let balance = await Luksotastic.methods
              .balanceOf(profileAddresses[i])
              .call();

            // Create frontend of the profile
            let temp = document.createElement('div');
            temp.className = 'Profile';
            temp.innerHTML =
              `<div class="ProfileArea">` +
              `<div class="ProfileDescription">` +
              `<div class="ProfileRank">RANK ${i + 1}: </div>` +
              `<div class="BlockchainAddress">${profileAddresses[i]}</div>` +
              `<div class="DescriptionText ">MetaMask Wallet without Profile Information</div>` +
              `</div>` +
              `</div>` +
              `<div class="ProfileDisplay">` +
              `<img id="backgroundImage" class="ProfileBackground" src="./metamask.png" alt="" ></img>` +
              `<div class="ProfileWing">MetaMask Wallet</div>` +
              `<div class="Spacer"></div>` +
              `<div class="ProfileWing">${balance} LSTC</div>` +
              `</div>` +
              `<div class="Spacer"></div>` +
              `<div class="SeperatorBlock Round">` +
              `<img id="profileImage" class="ProfilePicture" src="./metamask.png" alt="" ></img>` +
              `</div>`;
            // Add profile frontend to the explore page
            document.getElementById('exploreFooterContent').appendChild(temp);
          }
        }
      }
    } catch (err) {
      console.log('Profile could not be added to the frontend');
    }
  };

  /**
   * Create the frontend for an array
   * of asset address
   *
   * @param {string array} digitalAssets Array of asset addresses
   * @param {raw string} position Name of content area where assets will be displayed
   * @param {raw string} type type of position name: 'class' or 'id' property
   * @param {raw string} purpose purpose of asset: 'search' (search profile) or 'ranking' (explore page)
   */
  createAssetFrontend = async (digitalAssets, position, type, purpose) => {
    // Enable Web3
    const { web3 } = this.state;

    // Iterate through all received assets
    for (let i = 0; i < digitalAssets.length; i++) {
      try {
        let isCurrentOwner;

        // Check if asset is for search related to a certain universal profile
        if (purpose === 'search') {
          // Create instance of the asset to check owner balance
          const assetContract = new web3.eth.Contract(LSP8, digitalAssets[i]);

          /**
           * Check if the universal profile has an asset balance
           * greater than zero, to be sure the profile did not only
           * receive the item but also still holds it
           */
          isCurrentOwner = await assetContract.methods
            .balanceOf(this.state.address)
            .call();
        } else {
          /**
           * If the asset is fetched for the explorer page
           * owning does not play any role and will be
           * greenlighted
           */
          isCurrentOwner = 1;
        }

        if (isCurrentOwner > 0) {
          if (
            // If the rank of the asset is not filled, generate placeholder
            digitalAssets[i] === '0x0000000000000000000000000000000000000000'
          ) {
            // Instanciate unified frontend for the asset
            let temp = document.createElement('div');
            temp.id = 'blankAsset';
            temp.className = 'Asset';

            // Check if asset is for the explore page
            if (purpose === 'ranking') {
              // Fill asset element with ranking elements
              temp.innerHTML =
                `<div class="Ranking">RANK ${i + 1}</div>` +
                `<div class="Ranking">ADDRESS EMPTY</div>` +
                `<img class="AssetImg" src="./blank.png">` +
                `<div class="StatLineDisabled">` +
                `<div class="AssetStat">0</div>` +
                `<button class="InteractionDisabled">UPVOTE</button>` +
                `</div><p></p>` +
                `<div class="StatLineDisabled">` +
                `<div class="AssetStat">0</div>` +
                `<button class="InteractionDisabled">HYPE UP</button>` +
                `</div><p></p>` +
                `<div class="StatLineDisabled">` +
                `<div class="AssetStat">0</div>` +
                `<button class="InteractionDisabled">SUPPORT</button>` +
                `</div><p></p>`;
            } else {
              // Fill asset element with regular elements
              temp.innerHTML =
                `<img class="AssetImg" src="./blank.png">` +
                `<div class="StatLineDisabled">` +
                `<div class="AssetStat">0</div>` +
                `<button class="InteractionDisabled">UPVOTE</button>` +
                `</div><p></p>` +
                `<div class="StatLineDisabled">` +
                `<div class="AssetStat">0</div>` +
                `<button class="InteractionDisabled">HYPE UP</button>` +
                `</div><p></p>` +
                `<div class="StatLineDisabled">` +
                `<div class="AssetStat">0</div>` +
                `<button class="InteractionDisabled">SUPPORT</button>` +
                `</div><p></p>`;
            }

            // Add profile frontend to the explore page depending on their type
            if (type === 'class') {
              document.getElementsByClassName(position)[0].appendChild(temp);
            } else {
              document.getElementById(position).appendChild(temp);
            }
            continue;
          }
          // Asset address is not empty

          // Load information from the asset address
          const metaURL = await this.getAssetData(digitalAssets[i]);
          let jsonFromURL = await this.fetchJSON(metaURL);

          // Get the assets image file on IPFS
          let assetImageLink =
            jsonFromURL.LSP4Metadata.images[0][0].url.substr(7);
          // Store IPFS base URL
          let baseurl = 'https://ipfs.lukso.network/ipfs/';

          // Instanciate unified frontend for the asset
          let temp = document.createElement('div');
          temp.id = digitalAssets[i];
          temp.className = 'Asset';

          // Get LUKSOTASTIC stats for the asset
          let assetStats = await this.getLSTCAssetStats(digitalAssets[i]);

          // Check if asset is for the explore page
          if (purpose === 'ranking') {
            // Fill asset element with ranking elements
            temp.innerHTML =
              `<div class="Ranking">RANK ${i + 1}</div>` +
              `<div class="Ranking">${digitalAssets[i]}</div>` +
              `<img class="AssetImg" src=${baseurl}${assetImageLink}>` +
              `<div id="upvoteStatLine${digitalAssets[i]}" class="StatLine">` +
              `<div id="upvoteAmount" class="AssetStat" >${assetStats.upvoteAmount}</div>` +
              `<button id="upvote${digitalAssets[i]}" class="Interaction">UPVOTE</button>` +
              `</div><p></p>` +
              `<div id="hypeStatLine${digitalAssets[i]}" class="StatLine">` +
              `<div id="hypeAmount" class="AssetStat"> ${assetStats.hypeAmount}</div>` +
              `<button id="hype${digitalAssets[i]}" class="Interaction">HYPE UP</button>` +
              `</div><p></p>` +
              `<div id="supportStatLine${digitalAssets[i]}" class="StatLine">` +
              `<div id="supportAmount" class="AssetStat">${assetStats.supportAmount}</div>` +
              `<button id="support${digitalAssets[i]}" class="Interaction">SUPPORT</button>` +
              `</div><p></p>`;
          } else {
            // Fill asset element with regular elements
            temp.innerHTML =
              `<img class="AssetImg" src=${baseurl}${assetImageLink}>` +
              `<div id="upvoteStatLine${digitalAssets[i]}" class="StatLine">` +
              `<div id="upvoteAmount" class="AssetStat" >${assetStats.upvoteAmount}</div>` +
              `<button id="upvote${digitalAssets[i]}" class="Interaction">UPVOTE</button>` +
              `</div><p></p>` +
              `<div id="hypeStatLine${digitalAssets[i]}" class="StatLine">` +
              `<div id="hypeAmount" class="AssetStat"> ${assetStats.hypeAmount}</div>` +
              `<button id="hype${digitalAssets[i]}" class="Interaction">HYPE UP</button>` +
              `</div><p></p>` +
              `<div id="supportStatLine${digitalAssets[i]}" class="StatLine">` +
              `<div id="supportAmount" class="AssetStat">${assetStats.supportAmount}</div>` +
              `<button id="support${digitalAssets[i]}" class="Interaction">SUPPORT</button>` +
              `</div><p></p>`;
          }
          // Add profile frontend to the explore page depending on their type
          if (type === 'class') {
            document.getElementsByClassName(position)[0].appendChild(temp);
          } else {
            document.getElementById(position).appendChild(temp);
          }

          // Add upvote functionality to the upvote button
          document
            .getElementById('upvote' + digitalAssets[i])
            .addEventListener('click', () =>
              this.luksotasticInteraction(
                digitalAssets[i],
                this.state.address,
                0,
              ),
            );
          // Add hype functionality to the hype button
          document
            .getElementById('hype' + digitalAssets[i])
            .addEventListener('click', () =>
              this.luksotasticInteraction(
                digitalAssets[i],
                this.state.address,
                1,
              ),
            );
          // Add support functionality to the support button
          document
            .getElementById('support' + digitalAssets[i])
            .addEventListener('click', () =>
              this.luksotasticInteraction(
                digitalAssets[i],
                this.state.address,
                2,
              ),
            );
        }
      } catch (err) {
        console.log('Asset frontend could not be created');
      }
    }
  };

  /**
   * BACKEND
   */

  /**
   * Fetch the data of an profile
   * by an given address
   *
   * @param {raw string} type Fetch example profile ('sample') or user input ('custom')
   */
  fetchData = async (type) => {
    // Enable Web3
    const { web3 } = this.state;

    // Reset Frontend from last search
    this.resetView();

    let input;
    if (type === 'sample') {
      // Fetch profile information from sample address
      input = sampleAddress;
    } else {
      // Fetch profile information from user's input
      input = this.state.input;
    }

    let isAddr = false;
    try {
      // Check if address is blockchain address
      isAddr = web3.utils.toChecksumAddress(input);
      // Is address
      if (isAddr) {
        // Create ERC725 Contract from address and fetch its data
        const erc725 = new ERC725(ERC725schema, input, provider, Config);
        const fetchedData = await erc725.fetchData();

        // Convert background picture to link
        let rawBGPictures = [];
        for (let i in fetchedData.LSP3Profile.LSP3Profile.backgroundImage) {
          let baseurl = 'https://ipfs.lukso.network/ipfs/';
          rawBGPictures.push([
            i,
            baseurl +
              fetchedData.LSP3Profile.LSP3Profile.backgroundImage[
                i
              ].url.substring(7),
          ]);
        }

        // Convert profile picture to link
        let rawPFPictures = [];
        for (let i in fetchedData.LSP3Profile.LSP3Profile.profileImage) {
          let baseurl = 'https://ipfs.lukso.network/ipfs/';
          rawPFPictures.push([
            i,
            baseurl +
              fetchedData.LSP3Profile.LSP3Profile.profileImage[i].url.substring(
                7,
              ),
          ]);
        }

        // Show name and description
        this.setName(fetchedData.LSP3Profile.LSP3Profile.name);
        this.setDescription(fetchedData.LSP3Profile.LSP3Profile.description);

        // Update profile and background
        document.getElementById('profileImage').src = rawPFPictures[0][1];
        document.getElementById('backgroundImage').src = rawBGPictures[0][1];

        // Set internal variables
        this.setReceiver(fetchedData.LSP1UniversalReceiverDelegate);
        this.setAddress(input);

        // Gather all of the profile's owned assets and update LSTC balance
        this.getAssetsFromProfile();
        this.getLSTCBalance(this.state.address, 0);
      }
    } catch (e) {
      // No valid ERC725 contract address was given
      this.logInputError('This is not an ERC725 Contract');
    }
    // No input in general
    if (input.toString().length === 0) {
      this.logInputError('Please input an address first');
    }
  };

  /**
   * Get the balance of the app token for an specific address
   *
   * @param {raw string} address Wallet or profile address
   * @param {integer} type balance of profile (0) or user (1)
   */
  getLSTCBalance = async (address, type) => {
    try {
      // Enable Web3
      const { web3 } = this.state;

      // Create instance of LUKSOTASTIC smart contract
      const Luksotastic = new web3.eth.Contract(
        ProfileInteraction,
        backendAddress,
      );

      // Get the balance from the address
      let balance = await Luksotastic.methods.balanceOf(address).call();
      if (type === 0) {
        // Address is universal profile balance
        this.setBalance(balance);
      } else {
        // Adress is MetaMask account balance
        this.setUserBalance(balance);
      }
    } catch (err) {
      console.log('LSTC balance could not be updated');
    }
  };

  /**
   * Gather insteraction stats from an asset
   * from the smart contract
   *
   * @param {raw string} address address of the asset
   * @returns JSON with the asset's upvote-, hype-, and support-amounts
   */
  getLSTCAssetStats = async (address) => {
    try {
      // Enable Web3
      const { web3 } = this.state;

      // Create instance of LUKSOTASTIC smart contract
      const Luksotastic = new web3.eth.Contract(
        ProfileInteraction,
        backendAddress,
      );

      // Call getter of public variable
      return await Luksotastic.methods.assetInteraction(address).call();
    } catch (err) {
      this.log('LSTC stats could not been loaded');
    }
  };

  /**
   * Execute an interaction on an asset
   * on the LUKSOTASTIC smart contract
   *
   * @param {raw string} assetAddress address of the asset
   * @param {raw string} ownerAddress address of the loaded profile
   * @param {raw string} actionType upvote (0), hype (1), or support (2) interaction
   */
  luksotasticInteraction = async (assetAddress, ownerAddress, actionType) => {
    // Enable Web3
    const { web3 } = this.state;

    try {
      // Create instance of LUKSOTASTIC smart contract
      const Luksotastic = new web3.eth.Contract(
        ProfileInteraction,
        backendAddress,
      );

      // Send the interaction with the current MetaMask account
      await Luksotastic.methods
        .interaction(assetAddress, ownerAddress, actionType)
        .send({ from: web3.currentProvider.selectedAddress });
    } catch (err) {
      console.log('Interaction could not be executed');
    }
  };

  /**
   * Check if the interaction can be executed from
   * the current MetaMask account
   *
   * @param {*} assetAddress Address of MetaMask account
   * @returns true or false
   */
  checkLockedInteraction = async (assetAddress) => {
    // Enable Web3
    const { web3 } = this.state;

    try {
      // Create instance of LUKSOTASTIC smart contract
      const Luksotastic = new web3.eth.Contract(
        ProfileInteraction,
        backendAddress,
      );

      // Check public voteProof boolean of address
      let proof = await Luksotastic.methods
        .voteProof(web3.currentProvider.selectedAddress, assetAddress)
        .call();
      return proof;
    } catch (err) {
      console.log('Voting right of wallet address could not be checked');
    }
  };

  addLuksoTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x16',
            chainName: 'LUKSO L14',
            nativeCurrency: {
              name: 'LUKSO',
              symbol: 'LYX',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.l14.lukso.network'],
            blockExplorerUrls: ['https://blockscout.com/lukso/l14'],
          },
        ],
      });
    } catch (err) {
      // User denied access
    }
  };

  /**
   * Import the applications token with its picture to
   * the MetaMask interface
   */
  addTokenLogo = async () => {
    // Enable Web3
    const { web3 } = this.state;

    try {
      // Create instance of LUKSOTASTIC smart contract
      const Luksotastic = new web3.eth.Contract(
        ProfileInteraction,
        backendAddress,
      );

      // Get token metadata directly from the smart contract
      const tokenAddress = backendAddress;
      const tokenSymbol = await Luksotastic.methods.symbol().call();
      const tokenDecimals = await Luksotastic.methods.decimals().call();
      const tokenImage = window.location.href + '/luksotastic_logo.png';

      // Call the MetaMask interface for adding the token
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
    } catch (err) {
      // User denied MetaMask interaction
    }
  };

  /**
   * Gather all ever received assets from the universal profile
   * from it's universal receiver deligate smart contract address
   */
  getAssetsFromProfile = async () => {
    // Enable Web3
    const { web3 } = this.state;

    // Show progress
    this.logInputError('Profile Information loading');

    // Create instance of universal receiver smart contract
    const AddressStore = new web3.eth.Contract(LSP1, this.state.receiver);

    // Array for all raw values containing the asset's addresses
    let tokenAddresses = [];
    try {
      // Fetch all rawValues
      tokenAddresses = await AddressStore.methods.getAllRawValues().call();
    } catch (err) {
      console.log('Data from universal receiver could not be loaded');
    }

    // Array for the final addresses
    let digitalAssets = [];
    // Get the address from every value string
    for (let a = 0; a < tokenAddresses.length; a++) {
      digitalAssets[a] = web3.utils.toChecksumAddress(
        tokenAddresses[a].substr(26),
      );
    }

    // Generate all the asset's frontends from the adresses
    await this.createAssetFrontend(
      digitalAssets,
      'AssetArea',
      'class',
      'search',
    );

    // Lock assets where the user already interacted with
    await this.lockAssets(digitalAssets);

    // Lock support button if needed
    this.lockSupport(digitalAssets);

    // Show progress
    this.logInputError('Profile loaded');
  };

  /**
   * Call an asset's data on IPFS as webpage and
   * save it to JSON
   * @param {raw string} url IPFS link
   * @returns JSON asset data
   */
  fetchJSON = async (url) => {
    try {
      const response = await fetch(url);
      const exam = await response.json();
      return exam;
    } catch (error) {
      console.log('JSON data of IPFS link could not be fetched');
    }
  };

  /**
   * Load LUKSOTASTIC token metadata from the smart contract
   * to show total supply and active users
   */
  loadAppStats = async () => {
    // Enable Web3
    const { web3 } = this.state;
    let Luksotastic = new web3.eth.Contract(ProfileInteraction, backendAddress);

    let totalSupply = await Luksotastic.methods.totalSupply().call();
    let activeUsers = await Luksotastic.methods.totalUsers().call();

    this.setTotalSupply(totalSupply);
    this.setActiveUsers(activeUsers);
  };

  /**
   * Get data of an asset's address in JSON
   *
   * @param {*} assetAddress blockchain address
   * @returns JSON data
   */
  getAssetData = async (assetAddress) => {
    // Enable Web3
    const { web3 } = this.state;

    // Check if asset is LSP4D or new LSP8
    let assetInterfaceID = await this.checkInterface(assetAddress);
    try {
      // Old interface
      if (assetInterfaceID === 'old') {
        // Instanciate LSP4D smart contract
        const digitalAsset = new web3.eth.Contract(LSP4D, assetAddress);

        // Key for the meta data
        let metaKey;
        metaKey =
          '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e';

        // Fetch the encoded contract data
        let encodedLSP4Data = await digitalAsset.methods
          .getData(metaKey)
          .call();

        // Decode fetched data
        return this.decodeMetaData(encodedLSP4Data, assetAddress);
      }
      // New interface
      if (assetInterfaceID === 'new') {
        // Instanciate LSP8 smart contract
        const digitalAsset = new web3.eth.Contract(LSP8, assetAddress);

        // Key for the meta data
        let metaKey = [
          '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
        ];

        // Fetch the encoded contract data
        let encodedLSP8Data = await digitalAsset.methods
          .getData(metaKey)
          .call();

        // Decode fetched data
        return this.decodeMetaData(encodedLSP8Data, assetAddress);
      }
    } catch (err) {
      console.log('Data of assets address could not be loaded');
    }
  };

  /**
   * Decode the meta data of an asset to readable JSON
   *
   * @param {raw string} encodedLSP4Data Encoded contract data
   * @param {raw string} assetAddress Asset's blockchain address
   * @returns JSON decoded data
   */
  decodeMetaData = async (encodedLSP4Data, assetAddress) => {
    try {
      // Instance of the LSP4 with ERC725.js
      const erc725 = new ERC725(LSP4schema, assetAddress, provider, Config);

      // Decode the assets data
      let decodedLSP4Data = await erc725.decodeData({
        LSP4Metadata: encodedLSP4Data,
      });

      // Generate IPFS link from decoded meta data
      let storageLink =
        'https://ipfs.lukso.network/ipfs/' +
        decodedLSP4Data.LSP4Metadata.url.substring(7);
      return storageLink;
    } catch (err) {
      console.log('Data of an asset could not be decoded');
    }
  };

  /**
   * Load all asset addresses of a top lists
   * of LUKSOTASTIC interactions
   *
   * @param {integer} type upvote (0), hype (1), support (2), or balance (3) top list
   * @returns String Array of all asset addresses
   */
  loadStatistics = async (type) => {
    // Enable Web3
    const { web3 } = this.state;
    let assetAddresses = [];
    const Luksotastic = new web3.eth.Contract(
      ProfileInteraction,
      backendAddress,
    );
    let data;
    /**
     * Load top 9 upvoted assets
     *
     * @dev ranks 1-9 also hardcoded in ./contracts/ProfileInteraction.sol
     *  */
    for (let i = 0; i <= 8; i++) {
      switch (type) {
        case 0:
          // Call public array of upvote top list
          data = await Luksotastic.methods.topAssetUpvote(i).call();
          assetAddresses[i] = data.asset;
          break;
        case 1:
          // Call public array of upvote top list
          data = await Luksotastic.methods.topAssetHype(i).call();
          assetAddresses[i] = data.asset;
          break;
        case 2:
          // Call public array of upvote top list
          data = await Luksotastic.methods.topAssetSupport(i).call();
          assetAddresses[i] = data.asset;
          break;
        default:
          // Call public array of upvote top list
          data = await Luksotastic.methods.topAccounts(i).call();
          assetAddresses[i] = data;
          break;
      }
    }
    return assetAddresses;
  };

  /**
   * Check interface of a contract address
   * before calling functions on its contract
   *
   * @param {raw string} address Blockchain address
   * @returns string 'old' or 'new'
   */
  checkInterface = async (address) => {
    // Enable Web3
    const { web3 } = this.state;

    // Create Instance of the contract which is to be queried
    const AssetContract = new web3.eth.Contract(InterfaceID, address);

    // Store type of interface standard
    let standard;

    // Old version of ERC725Y
    const erc725YLegacy = '0x2bd57b73';
    let isERC725YLegacy = false;

    // Check if the contract is an old key-value store
    try {
      isERC725YLegacy = await AssetContract.methods
        .supportsInterface(erc725YLegacy)
        .call();
    } catch (err) {
      console.log('Address could not be checked for lagacy interface');
    }

    // New version of ERC725Y
    const erc725Y = '0x5a988c0f';
    let isERC725Y = false;

    // Check if the contract is an old key-value store
    try {
      isERC725Y = await AssetContract.methods.supportsInterface(erc725Y).call();
    } catch (err) {
      console.log('Address could not be checked for interface');
    }

    // Update standard variable
    if (isERC725YLegacy) {
      standard = 'old';
    }
    if (isERC725Y) {
      standard = 'new';
    }

    return standard;
  };

  /**
   * CORE STACK
   */

  /**
   * Checking the network that is selected by MetaMask
   * and launching the app interaction after LUKSO was set
   *
   * @returns false, if Network is not set to LUKSO
   */
  updateNetwork = async () => {
    // Get provider
    const web3Provider = window.ethereum;
    const web3 = new Web3(web3Provider);

    // Fetch network
    const networkID = await web3.eth.net.getId();
    const networkHost = await web3.eth.net._provider.host;
    if (networkID !== 22 && networkHost !== 'https://rpc.l14.lukso.network') {
      this.logMetaMask('Please set your network to the Lukso L14 Testnetwork');
      // LUKSO not set

      // Launch on Search page after startup
      if (!this.state.firstLauch) {
        this.navigate(0);
        this.lockApp();
        this.setFirstLaunch(true);
      }
      return;
    }
    // LUKSO selected
    else {
      this.logMetaMask('MetaMask connected to Lukso L14');

      // Update contract balances from user
      await this.getLSTCBalance(web3.currentProvider.selectedAddress, 1);

      // Launch on Search page after startup
      if (!this.state.enabled) {
        this.navigate(1);
        this.unlockApp();
        this.setFirstLaunch(true);
        this.setEnabled(true);
      }
    }
  };
}
export default App;
