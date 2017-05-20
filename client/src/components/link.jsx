import React from 'react';
import {Route} from 'react-router-dom';

const WrappedLink = (props) => {
  const onClick = props.onClick ? (e) => {
    props.onClick(e, props.history, props.path);
  } : (() => props.history.push(props.path));
  return (
    <div onClick={onClick}>
      {props.children}
    </div>
  );
};

/*
 * This wraps a component that navigates to a desired path when the component
 * is clicked. Use this instead of the Link component from react-router-dom
 * when it's important to be able to control event propagation (e.g. if the
 * link should be followed if the component is clicked but not if a child
 * component is clicked).
 *
 * props:
 *   to [string]: Path to navitage to
 *   onClick [function]: Function that gets executed when the wrapped component
 *                       is clicked.
 */
const LinkWrapper = (props) => {
  const {to, path, onClick, children} = props;
  const navPath = path ? path : to;
  return (
    <Route path='/'
           render={(props) => <WrappedLink path={navPath}
                                           onClick={onClick}
                                           children={children}
                                           {...props} />} />
  );
};

export default LinkWrapper;
