# google-maps-simulation

One page map application for a project i worked at university, because it is one page i just used simple routes and harcoded everything.

A google maps animation of simulating 2 vehicles(ambulance) routes.

This verison of code runs for aydın city of Turkey and aims to calculating travel times for 2 ambulances. when first ambulance goes to patient, second ambluance starts to go to hospital to for special medication. When two ambulances arrives at hospital, animation stops.

Currently runs at https://continual-lodge-385210.lm.r.appspot.com/

# Requirements

- Google maps api keys (one for front end, one for back end)
- In google cloud console activate Maps javascript api, Directions api, roads api
- node.js
- modules for nodejs => axios, body-parser, express, fs, path

# Start

run "node server.js" on console
go to URL localhost:8000 on your browser
