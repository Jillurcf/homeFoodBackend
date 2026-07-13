import {Image, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {SvgXml} from 'react-native-svg';
import {ExpandableSection} from 'react-native-ui-lib';
import tw from '../lib/tailwind';
import {IconBottomArrow, IconTopArrow} from '../assets/icons/Icons';

const Expend = ({data}: any) => {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const handleExpand = (index: number) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? -1 : index));
  };

  return (
    <View style={tw`mx-[4%] gap-2 py-6 bg-primary100`}>
      {data.map((item: any, index: number) => {
        const isExpanded = expandedIndex === index;
        return (
          <ExpandableSection
            key={index}
            expanded={isExpanded}
            sectionHeader={
              <View style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center gap-4`}>
                  <Image source={item.icon} />
                  <Text style={tw`text-title text-base font-RoboMedium`}>
                    {item.cate}
                  </Text>
                </View>
                <SvgXml
                  xml={isExpanded ? IconTopArrow : IconBottomArrow}
                  style={tw`pr-4`}
                />
              </View>
            }
            onPress={() => handleExpand(index)}>
            <View style={tw`my-2 mt-4`}>
              {item?.subCate?.map((subCate: any, subIndex: number) => (
                <TouchableOpacity
                  style={tw`py-2 border-b border-b-primary200`}
                  key={subIndex}>
                  <Text style={tw`text-subT text-sm font-RoboMedium`}>
                    {subCate.subCate}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ExpandableSection>
        );
      })}
    </View>
  );
};

export default Expend;
