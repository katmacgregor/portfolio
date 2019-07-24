import React from 'react';

import classNames from 'classnames/bind';
import './contentgrid.scss';

import ContentThumb from './contentthumb/contentthumb';


const projects = [
  {
    name: "CT Games",
    class: "ct_games",
    description: "HTML5 &amp Phaser-based games",
    folder: "ct/games",
    main_image: {
      src: "dory_five_thumb.jpg"
    }
  },
  {
    name: "shopDisney",
    class: "shopdisney",
    description: "Redesign of DisneyStore.com",
    folder: "shop",
    main_image: {
      src: "shop_dev.jpg"
    }
  },
  {
    name: "Star Wars",
    class: "starwars",
    description: "Redesign of StarWars.com",
    folder: "starwars",
    main_image: {
      src: "sw_home.jpg"
    }
  },

  {
    name: "Disney.com",
    class: "disney",
    description: "Disney storytelling",
    folder: "dcom",
    main_image: {
      src: "dcom_cars.jpg"
    }
  },
  {
    name: "Disney Junior",
    class: "disney_junior",
    description: "Child-focused redesign of DisneyJunior.com",
    folder: "junior",
    main_image: {
      src: "devicescomp_junior.png"
    }
  },
  {
    name: "Creative Technology",
    class: "ct",
    description: "In-house division of DCPI dedicated to interactive experiences",
    folder: "ct",
    main_image: {
      src: "ct_hp.png"
    }
  },
  {
    name: "Coloring Book",
    class: "coloring",
    description: "SVG-based coloring book",
    folder: "coloring",
    main_image: {
      src: "coloring_cms.jpg"
    }
  },
  {
    name: "Disney Tumblr",
    class: "tumblr",
    description: "UGC Contests for movie premieres",
    folder: "tumblr",
    main_image: {
      src: "tumblr_alice.jpg"
    }
  },
  {
    name: "YayArt",
    class: "yayart",
    description: "Responsive redesign of e-commerce user-centric art website",
    folder: "yayart",
    main_image: {
      src: "devicescomp_yay.png"
    }
  },
  {
    name: "The Force Awakens",
    class: "tfa",
    description: "Takeover of Disney.com for movie premiere",
    folder: "tfa",
    main_image: {
      src: "tfa_takeover.jpg"
    }
  },
  {
    name: "Playmation",
    class: "playmation",
    description: "Marketing site for Disney product",
    folder: "playmation",
    main_image: {
      src: "product_repulsor.jpg"
    }
  },
  {
    name: "ApartmentList",
    class: "apartmentlist",
    description: "Illustrated personas of 20 well-known urban neighborhoods",
    folder: "apt-list",
    main_image: {
      src: "ApartmentList-Personas_delivery-04.png"
    }
  }
];

const ContentGrid = ({className}) => (
  <div className={classNames("content-container-grid", className)}>
    {projects.map((project, i) => (
      <ContentThumb item={project} key={i}/>
    ))}
  </div>
);

export default ContentGrid;
