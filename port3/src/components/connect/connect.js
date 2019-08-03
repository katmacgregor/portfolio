import React from 'react';
import classNames from 'classnames/bind';
import './connect.scss';

const connectItems = [
  {
    id: "contact",
    link: "mailto:hello@katrinamacgregor.com",
    title: "Contact"
  },
  {
    id: "linkedin",
    link: "http://us.linkedin.com/in/katrinamacgregor",
    title: "LinkedIn",
    new: true
  },
  {
    id: "github",
    link: "https://github.com/katmacgregor",
    title: "Github",
    new: true
  },
  {
    id: "codepen",
    link: "http://codepen.io/katmacgregor/",
    title: "Code Pen",
    new: true
  },
  {
    id: "resume",
    link: `${process.env.PUBLIC_URL}/KMacGregor_resume_web.pdf`,
    title: "Resume"
  }
];

const Connect = ({size}) => (
  <div className={classNames('connect', {[`icons-${size}`]: size})}>
    {connectItems.map((item, i) => {
      const iconEl = <span className={classNames('icon', [item.id])} />;
      let content;

      if(item.new) {
        content = (
          <a href={item.link} title={item.title} className="skip-link-style" target="_blank" rel="noopener noreferrer" key={i}>
            {iconEl}
          </a>
        );
      } else {
        content = (
          <a href={item.link} title={item.title} className="skip-link-style" key={i}>
            {iconEl}
          </a>
        );
      }

      return content;
    })}
  </div>
);

export default Connect;
