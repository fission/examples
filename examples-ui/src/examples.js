import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActionArea from "@material-ui/core/CardActionArea";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";

import examples from "./resources/examples.json";

const languageLogos = [
  { language: 'Python', logo: '/logo/python-logo.svg' },
  { language: 'JavaScript', logo: './logo/nodejs-logo.svg' },
  { language: 'Go', logo: './logo/go-logo.svg' },
  { language: 'Java', logo: './logo/java-logo.svg' },
  { language: '.NET', logo: './logo/dotnet-logo.svg' },
  { language: 'Perl', logo: './logo/perl-logo.svg' },
  { language: 'PHP', logo: './logo/php-logo.svg' },
  { language: 'Ruby', logo: './logo/ruby-logo.svg' },
  { language: 'TensorFlow', logo: './logo/tensorflow-logo.svg' },
]

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: 200,
    flexShrink: 0,
  },
  drawerPaper: {
    marginTop: 65,
    width: 200,
    background: "#f5f5f5",
    padding: 10,
  },
  drawerContainer: {
    overflow: "auto",
  },
  card: {
    maxWidth: "250px",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function Examples() {
  const classes = useStyles();

  const [ checked, setChecked ] = React.useState(["All"]);
  const handleChange = (event) => {
    let value = event.target.name;
    let newChecked = [...checked];
    if (event.target.checked) {
      if (value === "All") {
        newChecked = ["All"];
      } else {
        const allindex = newChecked.indexOf("All");
        if (allindex > -1) {
          newChecked.splice(allindex, 1);
        }
        newChecked.push(value);
      }
    } else {
      const currentindex = newChecked.indexOf(value);
      newChecked.splice(currentindex, 1);
      if (newChecked.length === 0) {
        newChecked = ["All"];
      }
    }
    setChecked(newChecked);
  };

  return (
    <div style={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Avatar alt="fission" src="./logo/fission-env.png" />
          <Typography variant="h5" noWrap style={{ paddingLeft: "10px", fontWeight: "bold" }}>
            Fission Examples
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer className={classes.drawer} variant="permanent" classes={{ paper: classes.drawerPaper }}>
        <Typography variant="subtitle1" noWrap>Filter languages</Typography>
        <List style={{ padding: 0 }} dense>
          <ListItem key="All">
            <ListItemText id="All" primary="All" />
            <ListItemSecondaryAction>
              <Checkbox
                name="All"
                edge="end"
                onChange={handleChange}
                checked={checked.indexOf("All") !== -1}
                inputProps={{ "aria-labelledby": "All" }}
              />
            </ListItemSecondaryAction>
          </ListItem>
          {examples.map(example => (
            <ListItem key={example.language}>
              <ListItemText id={example.language} primary={example.language} />
              <ListItemSecondaryAction>
                <Checkbox
                  name={example.language}
                  edge="end"
                  onChange={handleChange}
                  checked={checked.indexOf(example.language) !== -1}
                  inputProps={{ "aria-labelledby": example.language }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <main className={classes.content}>
        <Toolbar />
        <Grid container spacing={4}>
          {examples.map(example => {
            if (checked.indexOf("All") === -1 && checked.indexOf(example.language) === -1) {
              return <></>;
            }

            const languageLogo = languageLogos.find(l => l.language === example.language)?.logo;
            return example.examples.map((exampleItem, index) => {
              const logo = languageLogo || 
                languageLogos.find(l => l.language === exampleItem.language)?.logo || "./logo/misc-logo.svg";
              return (
                <Grid item key={index}>
                  <Card className={classes.card} variant="outlined">
                    <CardActionArea href={exampleItem.link}
                      style={{ padding: "10px" }}>
                      <CardMedia
                        style={{
                          objectFit: "fill",
                          height: "100px",
                        }}
                        component="img"
                        image={logo}
                      />
                      <CardContent
                        style={{
                          paddingBottom: 0, paddingTop: "16px",
                        }}
                      >
                        <Typography variant="body1" component="h2">{exampleItem.name}</Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="p"
                        >
                          {exampleItem.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <div style={{ padding: "2px" }}>
                          {example.tags.concat(exampleItem.tags).map(t => (
                            <Chip
                              size="small"
                              key={t}
                              label={t}
                              style={{
                                margin: "3px",
                                background: "cadetblue",
                                color: "white",
                                pointerEvents: "none"
                              }}
                            />
                          ))}
                        </div>
                      </CardActions>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            });
          })}
        </Grid>
      </main>
    </div>
  );
}
