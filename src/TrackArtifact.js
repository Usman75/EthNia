import React from "react";
import getContractInstance, { web3DataFetch } from "./utils.js";
import Travel from "./contracts/Travel.json";

import {
  Row,
  Col,
  Container,
  Button,
  FormInput,
  Collapse,
  Card,
  CardFooter,
  CardBody,
  CardTitle,
  CardHeader,
  CardImg,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
} from "shards-react";

export default class TrackArtifact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      contract: null,
      accounts: null,
      web3: null,
      open: false,
    };

    this.toggle = this.toggle.bind(this);
    //this.runExample = this.runExample.bind(this);
  }

  toggle() {
    this.setState({ open: !this.state.open });
  }

  componentDidMount = async () => {
    const obj = await web3DataFetch();
    const accounts = obj.accounts;
    const contract = obj.contract;
    let count = await contract.methods
      .getPostCount()
      .call({ from: accounts[0] });
    let responses = [];
    for (let i = 0; i < count; i++) {
      let response = await contract.methods
        .getPosts(i)
        .call({ from: accounts[0] });
      responses.push(response);
    }
    console.log(responses);
    this.setState({
      web3: obj.web3,
      accounts: obj.accounts,
      contract: obj.contract,
      posts: responses,
    });
  };

  handleVote = async (event) => {
    const action = event.target.value;
    const { accounts, contract } = this.state;
    if (action === "yes") {
      await contract.methods
        .upvote(event.target.id)
        .send({ from: accounts[0] });
    } else {
      await contract.methods
        .downvote(event.target.id)
        .send({ from: accounts[0] });
    }
  };

  render() {
    const listItems = this.state.posts.map((item, index) => (
      <Col sm="12" md="4">
        <Card>
          <CardHeader style={{ fontSize: 22 }}>
            {JSON.parse(item.content).subject}
          </CardHeader>
          <CardImg
            className="card-img"
            src={"https://ipfs.io/ipfs/" + JSON.parse(item.content).ipfsId}
          />
          <CardBody>
            <hr />
            <p>Place Added By Name :- {item.addr.substr(0, 6).concat("...")}</p>
            <hr />
            <p>
              {JSON.parse(item.content).details.substr(0, 90).concat("...")}
              <Badge theme="success" onClick={this.toggle}>
                Read More
              </Badge>
            </p>
            <hr />
            <Badge theme="success">Upvotes :- {JSON.parse(item.upvotes)}</Badge>
            <Badge theme="danger">
              Downvotes :- {JSON.parse(item.downvotes)}
            </Badge>
            <br />
            <br />
            <Button
              id={index}
              theme="success"
              value="yes"
              onClick={this.handleVote}
            >
              It was Awesome
            </Button>
            <Button
              id={index}
              theme="danger"
              value="no"
              onClick={this.handleVote}
            >
              Not that Good
            </Button>
          </CardBody>
        </Card>
        <Modal open={this.state.open} toggle={this.toggle}>
          <ModalHeader>{JSON.parse(item.content).subject}</ModalHeader>
          <ModalBody>{JSON.parse(item.content).details}</ModalBody>
        </Modal>
      </Col>
    ));
    return (
      <div>
        <Container className="main-container">
          <Row>
            <Col sm="12" md="12">
              <div>
                <h3>Awesome Places Near You !!!</h3> <br />
                <Row>{listItems}</Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
