


import { Path } from "@/constant";
import styles from "./styles/home.module.scss";


import {
    DragDropContext,
    Droppable,
    Draggable,
    OnDragEndResponder,
  } from "@hello-pangea/dnd";
  import clsx from "clsx";

  import { useRef, useEffect } from "react";
  import { useLocation } from "react-router-dom";

  // import { Path } from "../constant";




export function ChatItem(props: {
    onClick?: () => void;
    onDelete?: () => void;
    title: string;
    count: number;
    time: string;
    selected: boolean;
    id: string;
    index: number;
    narrow?: boolean;
    // mask: Mask;
  }) {
    // const draggableRef = useRef<HTMLDivElement | null>(null);
    // useEffect(() => {
    //   if (props.selected && draggableRef.current) {
    //     draggableRef.current?.scrollIntoView({
    //       block: "center",
    //     });
    //   }
    // }, [props.selected]);
  
    const { pathname: currentPath } = useLocation();
  return (
    // <Draggable draggableId={`${props.id}`} index={props.index}>
    //   {(provided) => (
    //     <div
    //       className={clsx(styles["chat-item"], {
    //         [styles["chat-item-selected"]]:
    //           props.selected &&
    //           (currentPath === Path.Chat || currentPath === Path.Home),
    //       })}
    //       onClick={props.onClick}
    //       ref={(ele) => {
    //         draggableRef.current = ele;
    //         provided.innerRef(ele);
    //       }}
    //       {...provided.draggableProps}
    //       {...provided.dragHandleProps}
    //       title={`${props.title}\n${Locale.ChatItem.ChatItemCount(
    //         props.count,
    //       )}`}
    //     >
    //       {props.narrow ? (
    //         <div className={styles["chat-item-narrow"]}>
    //           <div className={clsx(styles["chat-item-avatar"], "no-dark")}>
    //             <MaskAvatar
    //               avatar={props.mask.avatar}
    //               model={props.mask.modelConfig.model}
    //             />
    //           </div>
    //           <div className={styles["chat-item-narrow-count"]}>
    //             {props.count}
    //           </div>
    //         </div>
    //       ) : (
    //         <>
    //           <div className={styles["chat-item-title"]}>{props.title}</div>
    //           <div className={styles["chat-item-info"]}>
    //             <div className={styles["chat-item-count"]}>
    //               {Locale.ChatItem.ChatItemCount(props.count)}
    //             </div>
    //             <div className={styles["chat-item-date"]}>{props.time}</div>
    //           </div>
    //         </>
    //       )}

    //       <div
    //         className={styles["chat-item-delete"]}
    //         onClickCapture={(e) => {
    //           props.onDelete?.();
    //           e.preventDefault();
    //           e.stopPropagation();
    //         }}
    //       >
    //         <DeleteIcon />
    //       </div>
    //     </div>
    //   )}
    // </Draggable>

    <div
      className={clsx(styles["chat-item"], {
        [styles["chat-item-selected"]]:
          props.selected &&
          (currentPath === Path.Chat || currentPath === Path.Home),
      })}
      onClick={props.onClick}
    >
      {(
      <>
        <div className={styles["chat-item-title"]}>{props.title}</div>
        <div className={styles["chat-item-info"]}>
          <div className={styles["chat-item-count"]}>
            {props.count}
          </div>
          <div className={styles["chat-item-date"]}>{props.time}</div>
        </div>
      </>
      )}

    </div>


    );
  }